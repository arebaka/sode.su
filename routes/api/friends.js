const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const db  = require("../../db");

router.post("/:type(mutual|incoming|outcoming)", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        const friends = await db.getFriends(req.cookies.userid, req.params.type);

        res
            .status(200)
            .json({ status: res.locals.api.errors.ok, data: friends });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

router.post("/add", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        if (typeof req.body.target != "number"
            || isNaN(req.body.target)
            || req.body.target !== parseInt(req.body.target)
            || req.body.target < 0
        ) {
            return res
                .status(400)
                .json({ status: res.locals.api.errors.invalid_value, param: "target" });
        }

        const friendship = await db.friend(req.cookies.userid, req.body.target);

        return friendship
            ? res
                .status(200)
                .json({ status: res.locals.api.errors.ok })
            : res
                .status(403)
                .json({ status: res.locals.api.errors.access_denied });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

module.exports = router;
