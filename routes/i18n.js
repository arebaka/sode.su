const path    = require("path");
const express = require("express");
const router  = express.Router();

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:name", async (req, res, next) => {
    res
        .type(".json")
        .sendFile(path.resolve(`public/i18n/${req.params.name}.json`), err => {
            if (err) {
                next(404);
            }
        });
});

module.exports = router;
