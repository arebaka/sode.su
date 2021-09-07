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
                ownerId:   parseInt(wall[1]),
                index:     parseInt(wall[2])
            },
            author: {
                type: author[0],
                id:   parseInt(author[1])
            },
            poll: poll ? {
                creatorType: poll[0],
                creatorId:   parseInt(poll[1]),
                index:       parseInt(poll[2])
            } : null,
            repost: repost ? {
                wallOwnerType: repost[0],
                wallOwnerId:   parseInt(repost[1]),
                wallIndex:     parseInt(repost[2]),
                index:         parseInt(repost[3])
            } : null
        };

        wall = await db.getWall(
            params.wall.ownerType, params.wall.ownerId, params.wall.index
        );
        if (!wall)
            return res
                .status(424)
                .json({ status: api.errors.doesnt_exists, param: "wall" });

        if (params.author.type != "user"
            || !(params.author.id === 0
                || params.author.id == req.cookies.userid)
            || (wall.anon_comments_only && params.author.id === 0)
        )
            return res
                .status(403)
                .json({ status: api.errors.access_denied });

        const relation = await db.getRelation(
            params.wall.ownerType, params.wall.ownerId, params.author.type, params.author.id
        );

        if (relation.banned || (
            relation.relation != "me" && (
                wall.postable == "private"
                    || (wall.postable == "protected"
                        && relation.relation != "friend"
        ))))
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
            wall.id, params.author.type, params.author.id,
            req.body.text, req.body.schedule,
            req.body.commentable, req.body.anon_comments_only,
            poll ? poll.id : null, repost ? repost.id : null,
            req.cookies.userid
        );

        post
            ? res
                .status(200)
                .json({ status: api.errors.ok })
            : res
                .status(403)
                .json({ status: api.errors.access_denied });
    }
    catch (err) {console.error(err);
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

router.post("/wall.posts", async (req, res, next) => {
    try {
        let parts = req.body.wall.split('/');

        wall = await db.getWall(
            parts[0], parts[1], parts[2]
        );
        if (!wall)
            return res
                .status(424)
                .json({ status: api.errors.doesnt_exists, param: "wall" });

        const relation = await db.getRelation(
            parts[0], parts[1], "user", req.cookies.userid
        );

        if (relation.relation != "me" && (
            wall.postable == "private"
                || (wall.visibility == "protected"
                    && relation.relation != "friend"
        )))
            return res
                .status(403)
                .json({ status: api.errors.access_denied });

        let posts = await db.getPosts(
            wall.id, req.body.sorting, req.body.offset, req.body.limit
        );

        for (let i = 0; i < posts.length; i++) {
            posts[i].sent_dt = db.formatDT(posts[i].sent_dt);
        }

        res
            .status(200)
            .json({ status: api.errors.ok, data: posts });
    }
    catch (err) {console.error(err);
        res
            .status(400)
            .json({ status: api.errors.invalid_data });
    }
});

module.exports = router;
