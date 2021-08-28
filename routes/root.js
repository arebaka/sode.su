const path    = require("path");
const fs      = require("fs");
const express = require("express");
const router  = express.Router();

const i18n  = require("../i18n");
const cache = require("../cache");

const entityRouter = require("./entities");

router.use(entityRouter);

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=3600");
    next();
});

router.get("/robots.txt", async (req, res) => {
    res
        .type("text")
        .sendFile(path.resolve("public/robots.txt"));
});

router.get("/api", async (req, res) => {
    res
        .type(".json")
        .json(res.locals.api);
});

router.get("/emoji.json", async (req, res) => {
    res
        .type(".json")
        .sendFile(path.resolve("public/emoji.json"));
});

router.get("/manifest.json", async (req, res) => {
    res
        .type(".json")
        .sendFile(path.resolve("public/manifest.json"));
});

router.get("/sitemap.xml", async (req, res) => {
    res
        .type(".xml")
        .sendFile(path.resolve("public/sitemap.xml"));
});

router.get("/favicon.ico", async(req, res) => {
    res
        .type(".ico")
        .sendFile(path.resolve("public/img/favicon.ico"));
});

router.get("/", async (req, res) => {
    const ogMeta = [
        { "og:image":     `${res.locals.api.host}/img/menu-head.png` },
        { "image:type":   "image/png" },
        { "image:width":  "1500" },
        { "image:height": "500" },
        { "og:image":     `${res.locals.api.host}/img/logo.png` },
        { "image:type":   "image/png" },
        { "image:width":  "3750" },
        { "image:height": "3750" }
    ]
        .map(i => `<meta name="${Object.keys(i)[0]}" content="${Object.values(i)[0]}" />`)
        .join("\n\t");

    res
        .status(200)
        .set("Cache-Control", "public, max-age=0")
        .type(".html")
        .send(cache.page({
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     i18n[res.locals.clientLang].index.descr,
            url:       req.hostname + req.path,
            css:       "css/index.css",
            canonical: res.locals.api.host + '/',
            title:     i18n[res.locals.clientLang].index.title,
            type:      "website",
            og:        ogMeta
        }));
});

module.exports = router;
