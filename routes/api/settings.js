const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/profile", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({status: api.errors.unauthorized});

        let status = api.errors.ok;

        if (typeof req.body.username == "string") {
            if (!req.body.username) {
                await db.setUsername(req.cookies.userid, null);
            } else if (!/[A-Za-z_][A-Za-z0-9_\-\.]*/.test(req.body.username)) {
                status = api.errors.invalid_data;
            } else if (req.body.username.length < api.limits.username_min_length) {
                status = api.errors.too_short;
            } else  if (req.body.username.length > api.limits.username_max_length) {
                status = api.errors.too_long;
            } else {
                await db.setAlias("user", req.cookies.userid, req.body.username);
            }
        }

        if (typeof req.body.name == "string") {
            if (!req.body.name) {
                status = api.errors.required;
            } else if (req.body.name.length > api.limits.name_max_length) {
                status = api.errors.too_long;
            } else {
                await db.setName("user", req.cookies.userid, req.body.name);
            }
        }

        if (typeof req.body.bio == "string") {
            if (!req.body.bio) {
                await db.setBio("user", req.cookies.userid, 1);
            } else if (req.body.bio.length > api.limits.bio_max_length) {
                status = api.errors.too_long;
            } else {
                await db.setBio("user", req.cookies.userid, 1);
            }
        }

        res
            .status(status == api.errors.ok ? 200 : 403)
            .json({ status: status });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }

});

router.post("/privacy", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({status: api.errors.unauthorized});

        let status = api.errors.ok;

        for (let option of ["friendable", "invitable", "commentable"]) {
            if (typeof req.body[option] == "string") {
                if (!["public", "protected", "private"].indexOf(req.body[option]) == -1) {
                    status = api.errors.invalid_value;
                } else {
                    await db.setPrivacy("user", req.cookies.userid, option, req.body[option]);
                }
            }
        }

        for (let flag of ["searchable", "anon_comments_only"]) {
            if (typeof req.body[flag] == "boolean") {
                await db.setPrivacy("user", req.cookies.userid, flag, req.body[flag]);
            }
        }

        res
            .status(status == api.errors.ok ? 200 : 403)
            .json({ status: status });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
