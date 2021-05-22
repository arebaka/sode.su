const path    = require("path");
const express = require("express");
const router  = express.Router();

const db    = require("../db");
const api   = require("../api");
const i18n  = require("../i18n");
const cache = require("../cache");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.get("/:entityType(@|~):entityId/profile.json", async (req, res, next) => {
    const profile = await db.getProfile(api.entities[req.params.entityType], req.params.entityId);
    if (!profile)
        return next(404);

    return res.json(profile);
});

router.get("/:entityType(@|~):entityId/bio.smu", async (req, res, next) => {
    const bio = await db.getBio(api.entities[req.params.entityType], req.params.entityId);

    if (bio === null)
        return next(404);

    return res
        .type("text")
        .send(bio);
});

router.get("/:entityType(@|~):entityId", async (req, res, next) => {
    const profile = await db.getProfile(api.entities[req.params.entityType], req.params.entityId);

    if (!profile)
        return next(404);
    if (!isNaN(req.params.entityId) && profile.alias)
        return res.redirect(req.path.replace(req.params.entityId, alias));

    res
        .type(".html")
        .send(cache.page({
            status:    200,
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     i18n[res.locals.clientLang].user.descr,
            url:       req.hostname + req.path,
            css:       "css/user.css",
            canonical: req.hostname + req.path,
            title:     i18n[res.locals.clientLang].user.title.replace(
                "{{name}}", profile.name ? profile.name : i18n[res.locals.clientLang].user.default.name
            ),
            type:      "profile"
        }));
});

module.exports = router;
