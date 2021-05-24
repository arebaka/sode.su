const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/profile/username", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({status: api.errors.unauthorized});

        let status;

        if (!req.body || typeof req.body != "string") {
            await db.setUsername(req.cookie.userid, null);
            status = api.errors.ok;
        } else if (!/[A-Za-z_][A-Za-z0-9_\-\.]*/.test(req.body)) {
            status = api.errors.invalid_data;
        } else if (req.body.length < api.limits.username_min_length) {
            status = api.errors.too_short;
        } else  if (req.body.length > api.limits.username_max_length) {
            status = api.errors.too_long;
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
