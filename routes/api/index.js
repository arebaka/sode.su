const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const https   = require("https");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

function checkType(value, param, type)
{
    if (value === null || value === undefined)
        return null;

    if (type.endsWith("[]")) {
        let invalid;
        type = type.replace("[]", "");

        if (typeof value != "object" || !Array.isArray(value))
            return { status: api.errors.invalid_data, param: param };

        for (let i = 0; i < value.length; i++) {
            invalid = checkType(value[i], `${param}[${i}]`, type);

            if (invalid)
                return { status: api.errors.invalid_data, param: invalid };
        }

        return null;
    }

    switch (type) {
    case "bool":
        if (typeof value != "boolean")
            return { status: api.errors.invalid_data, param: param };
    break;
    case "int":
        if (typeof value != "number"
            || isNaN(value)
            || value !== parseInt(value)
        )
            return { status: api.errors.invalid_data, param: param };
    break;
    case "uint64":
        if (typeof value != "number"
            || isNaN(value)
            || value !== parseInt(value)
            || value < 0
        )
            return { status: api.errors.invalid_data, param: param };
    break;
    case "str":
        if (typeof value != "string")
            return { status: api.errors.invalid_data, param: param };
    break;
    case "binary":
        if (typeof value != "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
            return { status: api.errors.invalid_data, param: param };
        value = Buffer.from(value, "base64");
    break;
    default:
        let struct = api.types[type];
        let invalid;

        if (struct.proto) {
            invalid = checkType(value, param, struct.proto);

            if (struct.enum && struct.enum.indexOf(value) == -1)
                return { status: api.errors.invalid_value, param: param };
            if (struct.pattern && !(new RegExp(struct.pattern)).test(value))
                return { status: api.errors.invalid_value, param: param };
            if (struct.min && value < struct.min)
                return { status: api.errors.out_of_range, param: param };
            if (struct.max && value > struct.max)
                return { status: api.errors.out_of_range, param: param };
            if (struct.min_length && value.length < struct.min_length)
                return { status: api.errors.too_short, param: param };
            if (struct.max_length && value.length > struct.max_length)
                return { status: api.errors.too_long, param: param };
            if (struct.max_size && Byffer.byteLength(value) > struct.max_size)
                return { status: api.errors.too_long, param: param };
        }
    break;
    }

    return null;
}

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.use("/:method", (req, res, next) => {
    const method = api.methods[req.params.method];

    if (method.auth && !res.locals.authorized)
        return res
            .status(401)
            .json({ status: api.errors.unauthorized });

    for (let param in method.params) {
        if (!method.params[param].nullable && (
            req.body[param] == null || req.body[param] == undefined
        ))
            return res
                .status(400)
                .json({ status: api.errors.missing_param, param: param });

        let error = checkType(req.body[param], param, method.params[param].type);
        if (error)
            return res
                .status(400)
                .json(error);
    }

    next();
});

router.use(require("./settings"));
router.use(require("./friends"));
router.use(require("./images"));
router.use(require("./wall"));

router.post("/me", async (req, res, next) => {
    try {
        let user = await db.getMe(req.cookies.userid);
        user.registered_dt = db.formatDT(user.registered_dt);

        user
            ? res
                .status(200)
                .json({ status: api.errors.ok, data: user })
            : res
                .status(401)
                .json({ status: api.errors.unauthorized });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/auth", async (req, res, next) => {
    try {
        const hash      = req.body.hash;
        let   dataCheck = [];
        delete req.body.hash;

        for (let key in req.body) {
            dataCheck.push(key + '=' + req.body[key]);
        }
        dataCheck.sort();
        dataCheck = dataCheck.join('\n');

        if (crypto.createHmac("sha256", db.tgSecretKey).update(dataCheck).digest("hex") !== hash)
            return res
                .status(401)
                .json({ status: api.errors.unauthorized });

        let   status;
        const user = await db.getUser(req.body.id);

        if (user) {
            status = 200;
        }
        else {
            const avatar = req.body.photo_url
                ? await new Promise((resolve, reject) => {
                    https.get(req.body.photo_url, result => {
                        if (result.statusCode == 302 && result.headers.location) {
                            https.get(result.headers.location, result => {
                                let chunks = [];

                                result.on("data", chunk => {
                                    chunks.push(chunk);
                                });
                                result.on("end", () => {
                                    resolve(Buffer.concat(chunks));
                                });
                            })
                        }
                    });
                }) : null;

            await db.createUser(req.body.id, req.body.username, req.body.first_name, req.body.auth_date, avatar);
            status = 201;
        }

        const session = await db.authUser(
            req.body.id, req.body.auth_date, req.cookies.session,
            res.locals.ip, req.useragent.source
        );

        return res
            .status(status)
            // will keep the session for 90 days
            .set("Set-Cookie", `session=${session}; path=/; domain=${api.domain}; max-age=${90 * 24 * 60 * 60}; samesite=lax; secure`)
            .json({
                status:   api.errors.ok,
                userid:   req.body.id,
                new_user: status == 201
            });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/logout", async (req, res, next) => {
    try {
        await db.destroySession(req.cookies.userid, req.cookies.session);

        res
            .status(200)
            .set("Set-Cookie", `session=; path=/; domain=${api.domain}; max-age=0; samesite=lax; secure`)
            .json({ status: api.errors.ok });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/entities", async (req, res, next) => {
    try {
        let lists = {
            user: [],
            club: []
        };
        let result = {};
        let parts;
        let entities;

        for (let descriptor of req.body.entities) {
            parts = descriptor.split('/');
            lists[parts[0]].push(parts[1]);
        }

        for (let i in lists) {
            if (lists[i].length) {
                entities = await db.getProfiles(i, lists[i]);
                for (let entity of entities) {
                    result[i + '/' + entity.id] = entity;
                }
            }
        }

        res
            .status(200)
            .json({ status: 200, data: result });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/relation", async (req, res, next) => {
    try {
        const parts = req.body.entity.split('/');

        if (parts[0] == "user" && parts[1] == req.cookies.userid) {
            return res
                .status(200)
                .json({ status: api.errors.ok, data: {
                    relation:       "me",
                    common_friends: 0,
                    common_clubs:   0,
                    note:           "",
                    banned:         false
                }});
        }

        const relation = await db.getRelation("user", req.cookies.userid, parts[0], parseInt(parts[1]));

        return relation
            ? res
                .status(200)
                .json({ status: api.errors.ok, data: relation })
            : res
                .status(424)
                .json({ status: api.errors.doesnt_exists });
    }
    catch (err) {console.log(err);
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
