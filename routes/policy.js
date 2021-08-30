const path    = require("path");
const express = require("express");
const router  = express.Router();

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/:locale(rus-RU)/terms", (req, res, next) => {
    res
        .type(".pdf")
        .sendFile(path.resolve(`public/policy/${req.params["locale"]}/terms.pdf`), err => {
            if (err) {
                next(404);
            }
        });
});

router.get("/:locale(rus-RU)/privacy", (req, res, next) => {
    res
        .type(".pdf")
        .sendFile(path.resolve(`public/policy/${req.params["locale"]}/privacy.pdf`), err => {
            if (err) {
                next(404);
            }
        });
});

module.exports = router;
