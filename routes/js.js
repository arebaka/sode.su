const path    = require("path");
const express = require("express");
const router  = express.Router();

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:name.js", (req, res, next) => {
    res
        .type(".js")
        .sendFile(path.resolve(`public/js${req.path}`), err => {
            if (err) {
                next(404);
            }
        });
});

module.exports = router;
