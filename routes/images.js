const path    = require("path");
const express = require("express");
const router  = express.Router();

const db  = require("../db");
const api = require("../api");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:albumOwnerPrefix(@|~):albumOwnerId/i/:album/name.:ext(jpeg|png|gif|bmp|webp|svg)", async (req, res, next) => {
    try {
        const image = await db.getImage(
            api.entities[req.params.albumOwnerPrefix], req.params.albumOwnerId, req.params.album, req.params.name, req.params.ext
        );
        if (!image)
            return next(404);

        res
            .type(`.${req.params.ext}`)
            .sendFile(path.resolve(`images/${req.params.ext}/${req.params.name}.${req.params.ext}`), err => {
                if (err) {
                    next(500);
                }
            });
    }
    catch (err) {
        next(500);
    }
});

module.exports = router;
