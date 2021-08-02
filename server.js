const fs           = require("fs");
const path         = require("path");
const express      = require("express");
const cookieParser = require("cookie-parser");
const useragent    = require("express-useragent");
const helmet       = require("helmet");
const compression  = require("compression");
const logger       = require("morgan");

const config = require("./config")
const db     = require("./db");
const api    = require("./api");
const i18n   = require("./i18n");
const cache  = require("./cache");
const router = require("./routes");




class Server
{
    constructor(port)
    {
        this.port = port;
        this.db   = db;
        this.app  = express();

        this.app.use(cookieParser());
        this.app.use(useragent.express());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use((req, res, next) => {
            res.locals.ip = req.header("x-real-ip") || req.ip;
            logger(res.locals.ip + ' - [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
                skip: (req, res) => req.method == "GET" && res.statusCode < 400
            })(req, res, next);
        });
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(helmet.contentSecurityPolicy({
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'", "oauth.telegram.org"],
                styleSrc:   ["'self'"],
                scriptSrc:  ["'self'", "'unsafe-eval'", "telegram.org"]
        }}));

        this.app.use(async (req, res, next) => {
            res.locals.clientLang = req.query["lang"] || req.cookies["lang"];
            if (!i18n[res.locals.clientLang]) {
                res.locals.clientLang = "eng";
            }
            res.locals.api = api[req.header("X-API-Version")] || api[0];

            res.set("Server",        "Desu");
            res.set("X-API-Version", res.locals.api.version);

            res.locals.authorized = req.cookies.userid && req.cookies.session
                    && await db.hasSession(req.cookies.userid, req.cookies.session)
                ? true : false;

            next();
        });

        this.app.get(/.+\/$/, (req, res, next) => res.redirect(req.url.slice(0, -1)));

        this.app.use("/i18n",     router.i18n);
        this.app.use("/img",      router.img);
        this.app.use("/css",      router.css);
        this.app.use("/layouts",  router.layouts);
        this.app.use("/js",       router.js);
        this.app.use("/settings", router.settings);
        this.app.use("/",         router.root);
        this.app.use("/api",      router.api);

        this.app.all(/.*/, (req, res, next) => next(404));

        this.app.use((err, req, res, next) => {
            if (isNaN(err)) {
                console.error(err);
                err = 500;
            }

            res
                .status(err)
                .type(".html")
                .set("Cache-Control", "public, max-age: 0")
                .send(cache.page({
                    status:    err,
                    lang:      i18n[res.locals.clientLang].meta.lang,
                    descr:     i18n[res.locals.clientLang].errors[404].descr,
                    url:       req.hostname + req.path,
                    css:       "css/basic.css",
                    canonical: req.hostname + req.path,
                    title:     i18n[res.locals.clientLang].errors[404].title,
                    type:      "website"
                }));
        });
    }

    async start()
    {
        await this.db.start();

        this.app.listen(this.port, () => {
            console.log(`Server running at localhost on port ${this.port}`);
        });

        this.app.on("connection", socket => {
            socket.setKeepAlive(true);
        });
    }

    async stop()
    {
        console.log("Stop the server...");
        await this.db.stop();
        process.exit(0);
    }

    async reload()
    {
        console.log("Reload the server...");
        cache.load();
        await this.db.restart();
        console.log("Server reloaded.");
    }
}




module.exports = Server;
