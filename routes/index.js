const path    = require("path");
const fs      = require("fs");
const express = require("express");
const router  = express.Router();

const api   = require("../api");
const i18n  = require("../i18n");
const cache = require("../cache");

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
        .json(api);
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
    res
        .set("Cache-Control", "public, max-age=0")
        .type(".html")
        .send(cache.page({
            status:    404,
            lang:      i18n[res.locals.clientLang].meta.lang,
            descr:     i18n[res.locals.clientLang].index.descr,
            url:       req.hostname + req.path,
            css:       "css/index.css",
            canonical: `${api.host}/`,
            title:     i18n[res.locals.clientLang].index.title,
            type:      "website"
        }));
});

module.exports = router;
