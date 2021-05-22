const path    = require("path");
const express = require("express");
const router  = express.Router();

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:name.:ext(ico|svg|png|jpeg|gif|webp)", async (req, res, next) => {
    res
        .type(`.${req.params.ext}`)
        .sendFile(path.resolve(`public/img${req.path}`), err => {
            if (err) {
                next(404);
            }
        });
});

module.exports = router;
