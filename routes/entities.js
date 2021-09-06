const path    = require("path");
const fs      = require("fs");
const express = require("express");
const jsesc   = require("jsesc");
const router  = express.Router();

const api   = require("../api");
const db    = require("../db");
const i18n  = require("../i18n");
const cache = require("../cache");
const media = require("../media");

router.get("/:prefix(@|~):descriptor*", async (req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");

    for (let i in api.entities) {
        if (api.entities[i].prefix == req.params.prefix) {
            res.locals.entityType = i;
            break;
        }
    }

    await next();
});

router.get("/:prefix(@|~):descriptor/profile", async (req, res, next) => {
    const profile = await db.getProfile(res.locals.entityType, req.params.descriptor);
    if (!profile)
        return next(404);

    res.json(profile);
});

router.get("/:prefix(@|~):descriptor/bio", async (req, res, next) => {
    const bio = await db.getBio(res.locals.entityType, req.params.descriptor);

    if (bio === null)
        return next(404);

    res
        .type("text")
        .send(bio);
});

router.get("/:prefix(@|~):descriptor", async (req, res, next) => {
    const profile = await db.getProfile(res.locals.entityType, req.params.descriptor);
    const bio     = await db.getBio(res.locals.entityType, req.params.descriptor);

    if (!profile)
        return next(404);
    if (!isNaN(req.params.descriptor) && profile.username)
        return res.redirect(req.path.replace(req.params.descriptor, profile.username));

    const ogMeta = [
        { "og:profile:first_name": jsesc(profile.name, { minimal: true }) || i18n[res.locals.clientLang].user.default.name },
        { "og:profile:username":   profile.username || profile.id },
        { "og:image":              profile.avatar ? `${api.host}${req.path}/i/0/${profile.avatar}` : `${api.host}/img/avatar.png` }
    ]
        .map(i => `<meta name="${Object.keys(i)[0]}" content="${Object.values(i)[0]}" />`)
        .join("\n\t");

    res
        .type(".html")
        .send(cache.page({
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     bio ? jsesc(bio.replace(/\s/g, ' '), { minimal: true }) : i18n[res.locals.clientLang].user.descr,
            url:       req.hostname + req.path,
            css:       "css/user.css",
            canonical: req.hostname + req.path,
            type:      "profile",
            title:     jsesc(i18n[res.locals.clientLang].user.title.replace(
                "{{name}}", profile.name || i18n[res.locals.clientLang].user.default.name
            ), { minimal: true }),
            og:        ogMeta
        }));
});

router.get("/:prefix(@|~):descriptor/i/:album/:hash.:format", async (req, res, next) => {
    const image = await db.getImage(
        res.locals.entityType, req.params.descriptor, req.params.album, req.params.hash, req.params.format
    );
    if (!image)
        return next(404);

    res.type('.' + image.format);

    fs.stat(path.resolve(`thumbs/${req.query.thumb}/${req.params.hash}.${req.params.format}`), (err, data) => {
        if (err)
            return res.sendFile(path.resolve(`images/${req.params.hash}.${req.params.format}`));
        res.sendFile(path.resolve(`thumbs/${req.query.thumb}/${req.params.hash}.${req.params.format}`));
    });
});

module.exports = router;
