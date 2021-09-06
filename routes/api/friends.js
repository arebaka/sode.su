const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/friends.get", async (req, res, next) => {
    try {
        let friends = await db.getFriends(req.cookies.userid, req.body.type);

        for (let i in friends) {
            friends[i].id = parseInt(friends[i].id);
            friends[i].since_dt = db.formatDT(friends[i].since_dt);
        }

        res
            .status(200)
            .json({ status: api.errors.ok, data: friends });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/friends.add", async (req, res, next) => {
    try {
        const relation = await db.getRelation("user", req.cookies.userid, "user", req.body.target);

        await new Promise(async (resolve, reject) => {
            if (relation.relation == "incoming")
                return resolve();
            if (relation.relation == "friend" || relation.relation == "outcoming")
                return reject([409, "conflict"]);

            const profile = await db.getProfile("user", req.body.target);

            if (profile.friendable == "public")
                return resolve();
            if (profile.friendable == "private")
                return reject([403, "access_denied"]);
            if (relation.common_friends > 0)
                return resolve();
            return reject([403, "access_denied"]);
        })
        .then(async () => {
            friendship = await db.friend(req.cookies.userid, req.body.target);

            return friendship
                ? res
                    .status(200)
                    .json({ status: api.errors.ok })
                : res
                    .status(403)
                    .json({ status: api.errors.access_denied });
        })
        .catch(status => {
            return res
                .status(status[0])
                .json({ status: status[1] });
        });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/friends.remove", async (req, res, next) => {
    try {
        const friendship = await db.unfriend(req.cookies.userid, req.body.target);

        friendship
            ? res
                .status(200)
                .json({ status: api.errors.ok })
            : res
                .status(424)
                .json({ status: api.errors.doesnt_exists });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/friends.note", async (req, res, next) => {
    try {
        const friendship = await db.noteFriend(req.cookies.userid, req.body.target, req.body.text);

        friendship
            ? res
                .status(200)
                .json({ status: api.errors.ok })
            : res
                .status(424)
                .json({ status: api.errors.doesnt_exists });
    }
    catch (err) {console.error(err);
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
