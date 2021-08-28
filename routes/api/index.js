const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const https   = require("https");
const router  = express.Router();

const db  = require("../../db");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.use("/set",     require("./settings"));
router.use("/friends", require("./friends"));
router.use("/images",  require("./images"));

router.post("/me", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        let user = await db.getMe(req.cookies.userid);
        user.registered_dt = db.formatDT(user.registered_dt);

        user
            ? res
                .status(200)
                .json({ status: res.locals.api.errors.ok, data: user })
            : res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
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
                .json({ status: res.locals.api.errors.unauthorized });

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
            .set("Set-Cookie", `session=${session}; path=/; domain=${res.locals.api.domain}; max-age=${90 * 24 * 60 * 60}; samesite=lax; secure`)
            .json({
                status:   res.locals.api.errors.ok,
                userid:   req.body.id,
                new_user: status == 201
            });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

router.post("/logout", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        await db.destroySession(req.cookies.userid, req.cookies.session);

        res
            .status(200)
            .set("Set-Cookie", `session=; path=/; domain=${res.locals.api.domain}; max-age=0; samesite=lax; secure`)
            .json({ status: res.locals.api.errors.ok });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

router.post("/entities", async (req, res, next) => {
    try {
        if (typeof req.body != "object" || !Array.isArray(req.body))
            return next(400);

        let lists = {
            user: [],
            club: []
        };
        let result = {};
        let parts;
        let entities;

        for (let descriptor of req.body) {
            parts = descriptor.split('/');

            if (parts.length != 2 || !/^[1-9][0-9]*$/.test(parts[1]))
                return next(400);

            switch (parts[0]) {
            case "user":
            case "club":
                lists[parts[0]].push(parts[1]);
            break;
            default: break;
            }
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
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

module.exports = router;
