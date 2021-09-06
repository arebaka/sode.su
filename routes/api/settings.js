const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/set.profile", async (req, res, next) => {
    try {
        let status = api.errors.ok;

        if (req.body.avatar !== null && req.body.avatar !== undefined) {
            if (req.body.avatar) {
                let parts = req.body.avatar.split('.');
    
                if (!await db.setAvatar("user", req.cookies.userid, parts[0], parts[1]))
                    return res
                        .status(424)
                        .json({ status: api.errors.doesnt_exists, param: "avatar" });
            }
            else {
                await db.setAvatar("user", req.cookies.userid, null, null);
            }
        }

        if (req.body.username !== null && req.body.username !== undefined) {
            if (req.body.username) {
                if (!await db.setAlias("user", req.cookies.userid, req.body.username))
                    return res
                        .status(409)
                        .json({ status: api.errors.conflict, param: "username" });
            } else {
                await db.setUsername(req.cookies.userid, null);
            }
        }

        if (req.body.name !== null && req.body.name !== undefined) {
            await db.setName("user", req.cookies.userid, req.body.name, req.cookies.userid);
        }

        if (req.body.bio !== null && req.body.bio !== undefined) {
            await db.setBio("user", req.cookies.userid, req.body.bio, req.cookies.userid);
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

router.post("/set.privacy", async (req, res, next) => {
    try {
        let status = api.errors.ok;

        for (let option of ["friendable", "invitable"]) {
            await db.setPrivacy("user", req.cookies.userid, option, req.body[option]);
        }
        for (let flag of ["searchable"]) {
            await db.setPrivacy("user", req.cookies.userid, flag, req.body[flag]);
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
