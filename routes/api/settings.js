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
                await db.setUsername(req.cookies.userid, req.body.username);
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
