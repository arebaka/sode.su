const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const db  = require("../../db");

router.post("/profile", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        let status = res.locals.api.errors.ok;

        if (typeof req.body.avatar == "string") {
            if (req.body.avatar.length === 0) {
                await db.setAvatar("user", req.cookies.userid, null, null);
            }
            else {
                let parts = req.body.avatar.split('.');
    
                if (!await db.setAvatar("user", req.cookies.userid, parts[0], parts[1])) {
                    return res
                        .status(424)
                        .json({ status: res.locals.api.errors.doesnt_exists, param: "avatar" });
                };
            }
        }

        if (typeof req.body.username == "string") {
            if (!req.body.username) {
                await db.setUsername(req.cookies.userid, null);
            } else if (!/^[A-Za-z_][A-Za-z0-9_\-\.]*$/.test(req.body.username)) {
                status = res.locals.api.errors.invalid_data;
            } else if (req.body.username.length < res.locals.api.types.Username.min_length) {
                status = res.locals.api.errors.too_short;
            } else  if (req.body.username.length > res.locals.api.types.Username.max_length) {
                status = res.locals.api.errors.too_long;
            } else {
                if (!await db.setAlias("user", req.cookies.userid, req.body.username))
                    return res
                        .status(409)
                        .json({ status: res.locals.api.errors.conflict, param: "username" });
            }
        }

        if (typeof req.body.name == "string") {
            if (!req.body.name) {
                status = res.locals.api.errors.missind_param;
            } else if (req.body.name.length > res.locals.api.types.Entity_Name.max_length) {
                status = res.locals.api.errors.too_long;
            } else {
                await db.setName("user", req.cookies.userid, req.body.name, req.cookies.userid);
            }
        }

        if (typeof req.body.bio == "string") {
            if (!req.body.bio) {
                await db.setBio("user", req.cookies.userid, "", req.cookies.userid);
            } else if (req.body.bio.length > res.locals.api.types.Bio.max_length) {
                status = res.locals.api.errors.too_long;
            } else {
                await db.setBio("user", req.cookies.userid, req.body.bio, req.cookies.userid);
            }
        }

        res
            .status(status == res.locals.api.errors.ok ? 200 : 403)
            .json({ status: status });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }

});

router.post("/privacy", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({status: res.locals.api.errors.unauthorized});

        let status = res.locals.api.errors.ok;

        for (let option of ["friendable", "invitable", "commentable"]) {
            if (typeof req.body[option] == "string") {
                if (!["public", "protected", "private"].indexOf(req.body[option]) == -1) {
                    status = res.locals.api.errors.invalid_value;
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
            .status(status == res.locals.api.errors.ok ? 200 : 403)
            .json({ status: status });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

module.exports = router;
