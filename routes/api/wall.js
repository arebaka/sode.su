const path    = require("path");
const crypto  = require("crypto");
const express = require("express");
const router  = express.Router();

const api = require("../../api");
const db  = require("../../db");

router.post("/wall.post", async (req, res, next) => {
    try {
        let wall   = req.body.wall.split('/');
        let author = req.body.author.split('/');
        let poll   = req.body.poll   ? req.body.poll.split('/')   : null;
        let repost = req.body.repost ? req.body.repost.split('/') : null;

        const params = {
            wall: {
                ownerType: wall[0],
                ownerId:   wall[1],
                index:     wall[2]
            },
            author: {
                type: author[0],
                id:   author[1]
            },
            poll: poll ? {
                creatorType: poll[0],
                creatorId:   poll[1],
                index:       poll[2]
            } : null,
            repost: repost ? {
                wallOwnerType: repost[0],
                wallOwnerId:   repost[1],
                wallIndex:     repost[2],
                index:         repost[3]
            } : null
        };

        wall = await db.getWall(
            params.wall.ownerType, params.wall.ownerId, params.wall.index
        );
        if (!wall)
            return res
                .status(424)
                .json({ status: api.erorrs.doesnt_exists, param: "wall" });

        if (params.author.type != "user"
            || !(params.author.id === 0
                || params.author.id == req.cookies.userid)
            || (wall.anon_comments_only && params.author.id === 0)
        )
            return res
                .status(403)
                .json({ status: api.errors.access_denied });

        const relation = await db.getRelation(params.author.type, params.author.id, params.wall.ownerType, params.wall.ownerId);

        if (relation.banned || (
            relation.friend != "me" && (
                wall.postable != "public"
                    || wall.postable == "private"
                    || relation.friend != "mutual"
        )))
            return res
                .status(403)
                .json({ status: api.errors.access_denied });

        poll = null;
/*
        if (params.poll) {
            poll = await db.getPoll(
                params.poll.creatorType, params.poll.creatorId, params.poll.index
            );
            if (!poll)
                return res
                    .status(424)
                    .json({ status: api.errors.doesnt_exists, param: "poll" });
        }
*/
        repost = null;
/*
        if (params.repost) {
            repost = await db.getPost(
                params.repost.wallOwnerType, params.repost.wallOwnerId,
                params.repost.wallIndex, params.repost.index
            );
            if (!repost)
                return res
                    .status(424)
                    .json({ status: api.errors.doesnt_exists, param: "repost" });
        }
*/
        const post = await db.post(
            wall.id, author.type, author.id,
            req.params.text, req.params.schedule,
            req.params.commentable, req.params.anon_comments_only,
            poll ? poll.id : null, repost ? repost.id : null
        );

        post
            ? res
                .status(200)
                .json({ status: api.errors.ok })
            : res
                .status(403)
                .json({ status: api.errors.access_denied });
    }
    catch (err) {
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
