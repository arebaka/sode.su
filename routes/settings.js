const path    = require("path");
const express = require("express");
const router  = express.Router();

const api   = require("../api");
const i18n  = require("../i18n");
const cache = require("../cache");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.get("/:section?", (req, res, next) => {
    if (req.params.section && !api.methods.settings[req.params.section])
        return next(404);

    res
        .set("Cache-Control", "public, max-age=0")
        .type(".html")
        .send(cache.page({
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     i18n[res.locals.clientLang].settings.descr,
            url:       req.hostname + req.path,
            css:       "css/basic.css",
            canonical: req.hostname + req.path,
            title:     i18n[res.locals.clientLang].settings.title,
            type:      "website"
        }));
});

module.exports = router;
