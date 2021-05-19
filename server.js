const fs           = require("fs");
const path         = require("path");
const https        = require("https");
const express      = require("express");
const cookieParser = require("cookie-parser");
const useragent    = require("express-useragent");
const helmet       = require("helmet");
const csrf         = require("csurf");

const { compress, decompress } = require("express-compress");

const indexRouter = require("./routes");
const i18nRouter  = require("./routes/i18n");
const imgRouter   = require("./routes/img");
const cssRouter   = require("./routes/css");
const htmlRouter  = require("./routes/html");
const jsRouter    = require("./routes/js");

const db  = require("./db");
const api = require("./api");



class Server
{
    constructor(port)
    {
        this.server = null;
        this.port   = port;
        this.db     = db;

        this.app = express();

        this.app.use(useragent.express());
        this.app.use(cookieParser());
        this.app.use(helmet());
        this.app.use(csrf({ cookie: true }));
        this.app.use(compress());
        this.app.use(decompress());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((req, res, next) => {
            res.set("Server", "Desu");
            next();
        });

        this.app.use("/",     indexRouter);
        this.app.use("/i18n", i18nRouter);
        this.app.use("/img",  imgRouter);
        this.app.use("/css",  cssRouter);
        this.app.use("/html", htmlRouter);
        this.app.use("/js",   jsRouter);

        this.app.use((err, req, res, next) => {
            res
                .status(err)
                .type(".html")
                .set("Cache-Control", "public, max-age: 0")
                .sendFile(path.resolve(`html/errors/${err}.html`));
        });

        if (this.port == 443) {
            this.server = https.createServer({
                    key:  fs.readFileSync(process.env.CERT_KEY),
                    cert: fs.readFileSync(process.env.CERT_CHAIN)
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

        server.on("connection", socket => {
            socket.keepAlive(true);
        })
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
        await this.db.restart();
        console.log("Server reloaded.");
    }
}




module.exports = Server;
