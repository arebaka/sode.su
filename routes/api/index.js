const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const db  = require("../../db");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.use("/set", require("./settings.js"));

router.post("/me", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        const user = await db.getMe(req.cookies.userid);

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
            await db.createUser(req.body.id, req.body.username, req.body.first_name, req.body.auth_date);
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
        console.error(err);
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

module.exports = router;
