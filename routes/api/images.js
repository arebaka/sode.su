const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const db  = require("../../db");

router.post("/upload", async (req, res, next) => {
    try {
        if (!res.locals.authorized)
            return res
                .status(401)
                .json({ status: res.locals.api.errors.unauthorized });

        let invalidParams = [];

        for (let param in res.locals.api.methods["images.upload"].params) {
            if (!req.body[param] && req.body[param] !== 0
                && !res.locals.api.methods["images.upload"].params[param].nullable
            ) {
                invalidParams.push(param);
            }
        }

        if (invalidParams.length)
            return res
                .status(400)
                .json({ status: res.locals.api.errors.missing_param, params: invalidParams });

        if (typeof req.body.album_owner != "string"
            || !req.body.album_owner.match(new RegExp(res.locals.api.types.Serialized_Entity.pattern))
        ) {
            invalidParams.push("album_owner");
        }

        if (typeof req.body.album_index != "number"
            || isNaN(req.body.album_index)
            || req.body.album_index !== parseInt(req.body.album_index)
            || req.body.album_index < 0
        ) {
            invalidParams.push("album_index");
        }

        if (typeof req.body.file != "string"
            || !req.body.file.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)
        ) {
            invalidParams.push("file");
        }

        if (invalidParams.length)
            return res
                .status(400)
                .json({ status: res.locals.api.errors.invalid_value, params: invalidParams });

        const file            = Buffer.from(req.body.file, "base64");
        const albumOwnerParts = req.body.album_owner.split('/');
        const albumOwnerType  = albumOwnerParts[0];
        const albumOwnerId    = parseInt(albumOwnerParts[1]);

        if (Buffer.byteLength(file) > res.locals.api.types.Image.max_size)
            return res
                .status(413)
                .json({ status: res.locals.api.errors.too_long, param: "file" });

        if (typeof req.body.descr == "string" && req.body.descr.length > res.locals.api.types.Image_Descr.max_length)
            return res
                .status(413)
                .json({ status: res.locals.api.errors.too_long, param: "descr" });

        if (albumOwnerType != "user" || albumOwnerId != req.cookies.userid)
            return res
                .status(403)
                .json({ status: res.locals.api.errors.access_denied });

        const success = await db.addImage(
            file, "user", req.cookies.userid, albumOwnerType, albumOwnerId, req.body.album_index,
            typeof req.body.descr == "string" ? req.body.descr : null, req.cookies.userid
        );

        return success
            ? res
                .status(200)
                .json({ status: res.locals.api.errors.ok })
            : res
                .status(400)
                .json({ status: res.locals.api.errors.invalid_data });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: res.locals.api.errors.invalid_data });
    }
});

module.exports = router;
