const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../api");
const db  = require("../db");

router.use((req, res, next) => {
    res.set("Cache-Control", "public, max-age=0");
    next();
});

router.post("/auth", async (req, res, next) => {
    try {
        let hash      = req.body.hash;
        let dataCheck = [];
        delete req.body.hash;

        for (let key in req.body) {
            dataCheck.push(key + '=' + req.body[key]);
        }
        dataCheck.sort();
        dataCheck = dataCheck
            .join('\n');

        if (crypto.createHmac("sha256", db.tgSecretKey).update(dataCheck).digest("hex") === hash)
            return res
                .status(200)
                .json({ status: api.errors.ok });

        res
            .status(401)
            .json({ status: api.errors.unauthorized });
    }
    catch (err) {
        console.log(err);
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
