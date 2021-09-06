const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/images.upload", async (req, res, next) => {
    try {
        if (albumOwnerType != "user" || albumOwnerId != req.cookies.userid)
            return res
                .status(403)
                .json({ status: api.errors.access_denied });

        const success = await db.addImage(
            file, "user", req.cookies.userid, albumOwnerType, albumOwnerId,
            req.body.album_index, req.body.descr, req.cookies.userid
        );

        return success
            ? res
                .status(200)
                .json({ status: api.errors.ok })
            : res
                .status(400)
                .json({ status: api.errors.invalid_data });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
