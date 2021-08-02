const path    = require("path");
const express = require("express");
const router  = express.Router();

const db    = require("../db");
const i18n  = require("../i18n");
const cache = require("../cache");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.get("/:prefix(@|~):descriptor/profile.json", async (req, res, next) => {
    let entityType;

    for (let i in res.locals.api.entities) {
        if (res.locals.api.entities[i].prefix == req.params.prefix) {
            entityType = i;
            break;
        }
    }
    if (!entityType)
        return next(404);

    const profile = await db.getProfile(entityType, req.params.descriptor);
    if (!profile)
        return next(404);

    res.json(profile);
});

router.get("/:prefix(@|~):descriptor/bio", async (req, res, next) => {
    let entityType;

    for (let i in res.locals.api.entities) {
        if (res.locals.api.entities[i].prefix == req.params.prefix) {
            entityType = i;
            break;
        }
    }
    if (!entityType)
        return next(404);

    const bio = await db.getBio(entityType, req.params.descriptor);

    if (bio === null)
        return next(404);

    res
        .type("text")
        .send(bio);
});

router.get("/:prefix(@|~):descriptor", async (req, res, next) => {
    let entityType;

    for (let i in res.locals.api.entities) {
        if (res.locals.api.entities[i].prefix == req.params.prefix) {
            entityType = i;
            break;
        }
    }
    if (!entityType)
        return next(404);

    const profile = await db.getProfile(entityType, req.params.descriptor);

    if (!profile)
        return next(404);
    if (!isNaN(req.params.descriptor) && profile.username)
        return res.redirect(req.path.replace(req.params.descriptor, profile.username));

    res
        .type(".html")
        .send(cache.page({
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     i18n[res.locals.clientLang].user.descr,
            url:       req.hostname + req.path,
            css:       "css/user.css",
            canonical: req.hostname + req.path,
            type:      "profile",
            title:     i18n[res.locals.clientLang].user.title.replace(
                "{{name}}", profile.name
                    ? profile.name
                    : i18n[res.locals.clientLang].user.default.name
            )
        }));
});

module.exports = router;
