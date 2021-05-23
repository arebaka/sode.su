const fs           = require("fs");
const path         = require("path");
const https        = require("https");
const express      = require("express");
const cookieParser = require("cookie-parser");
const useragent    = require("express-useragent");
const helmet       = require("helmet");
const compression  = require("compression");
const logger       = require("morgan");

const indexRouter  = require("./routes");
const i18nRouter   = require("./routes/i18n");
const imgRouter    = require("./routes/img");
const cssRouter    = require("./routes/css");
const layoutRouter = require("./routes/layouts");
const jsRouter     = require("./routes/js");
const entityRouter = require("./routes/entities");
const apiRouter    = require("./routes/api");

const db    = require("./db");
const api   = require("./api");
const i18n  = require("./i18n");
const cache = require("./cache");



class Server
{
    constructor(port)
    {
        this.server = null;
        this.port   = port;
        this.db     = db;

        this.app = express();

        this.app.use(cookieParser());
        this.app.use(useragent.express());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(logger("common", {
            skip: (req, res) => req.method == "GET" && res.statusCode < 400
        }));
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
            if (!i18n[res.locals.clientLang]){
                res.locals.clientLang = "eng";
            }

            res.set("Server", "Desu");
            res.set("X-API-Version", "0");

            res.locals.authorized = req.cookies.userid && req.cookies.session
                    && await db.hasSession(req.cookies.userid, req.cookies.session)
                ? true : false;

            next();
        });

        this.app.get(/.+\/$/, (req, res, next) => res.redirect(req.url.slice(0, -1)));

        this.app.use("/i18n",    i18nRouter);
        this.app.use("/img",     imgRouter);
        this.app.use("/css",     cssRouter);
        this.app.use("/layouts", layoutRouter);
        this.app.use("/js",      jsRouter);
        this.app.use("/",        entityRouter);
        this.app.use("/",        indexRouter);
        this.app.use("/api",     apiRouter);

        this.app.all(/.*/, (req, res, next) => next(404));

        this.app.use((err, req, res, next) => {
            if (isNaN(err))
                err = 500;
            console.log(req.url);

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

        if (this.port == 443) {
            this.server = https.createServer({
                    key:  fs.readFileSync(process.env.CERT_KEY).toString(),
                    cert: fs.readFileSync(process.env.CERT_CHAIN).toString()
                },
                this.app
            );
        }
    }

    async start()
    {
        const server = this.server ? this.server : this.app;

        await this.db.start();

        server.listen(this.port, () => {
            console.log(`Server running at localhost on port ${this.port}`);
        });

//        server.on("connection", socket => {
//            socket.keepAlive(true);
//        });
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
