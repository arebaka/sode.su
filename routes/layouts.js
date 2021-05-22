const path    = require("path");
const express = require("express");
const router  = express.Router();

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:name.html", (req, res, next) => {
    res
        .type(".html")
        .sendFile(path.resolve(`public/html${req.path}`), err => {
            if (err) {
                next(404);
            }
        });
});

module.exports = router;
