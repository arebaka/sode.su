const path   = require("path");
const fs     = require("fs");
const crypto = require("crypto");
const pg     = require("pg");

const { spawn }      = require("child_process");
const { v4: uuidv4 } = require("uuid");

const config = require("../config");
const media  = require("../media");
const api    = require("../api");
const { image } = require("../media");

class DBHelper
{
    constructor()
    {
        this.pool = null;

        this.tgSecretKey = crypto
            .createHash("sha256")
            .update(config.bot.token)
            .digest();

        this.entityTables = {
            user: {
                account: "users",
                profile: "user_profiles"
            },
            club: {
                account: "clubs",
                profile: "club_profiles"
            }
        };

        this.artifactPatters = {
            number:   /[+–-]?([0-9]*\.)?[0-9]+/g,
            mention:  /(?:^|\s)(@|~)[A-Za-z][A-Za-z0-9\\-\\.]*/g,
            hashtag:  /(?:^|\s)#[^ !"#%&()*+,.:;<=>?\[\/\]\^{|}]/g,
            slashtag: /(?:^|\s)\/[^ !"#%&()*+,.:;<=>?\[\/\]\^{|}]/g,
            cashtag:  /(?:^|\s)(¤|\$|€|₿|₽|¥)[0-9A-Za-z_-]/g,
            phone:    /(\+\d{1,3}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g,
            email:    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g,
            uri:      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
            emoji:    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g
        };
    }

    async _getArtifact(type, string)
    {
        const hash = await this.hash(string);

        const content = await this.pool.query(`
                insert into content (hash, uploader_id, text)
                values ($1, $2, $3)
                on conflict (hash) do
                update set hash = $1
                returning id, hash
            `, [hash, 0, string]);

        const artifact = await this.pool.query(`
                insert into artifacts (type, string_id)
                values ($1, $2)
                on conflict (type, string_id) do
                update set type = $1
                returning id
            `, [type, content.rows[0].id]);

        await this.pool.query(`
                insert into artifacts_in_content (content_id, artifact_id, "offset", length)
                values ($1, $2, $3, $4)
                on conflict do nothing
            `, [
                content.rows[0].id, artifact.rows[0].id,
                0, Array.from(string).length
            ]);

        return artifact.rows[0].id;
    }

    async _getContent(text, uploaderId)
    {
        const hash = await this.hash(text);

        const content = await this.pool.query(`
                insert into content (hash, uploader_id, text)
                values ($1, $2, $3)
                on conflict (hash) do
                update set hash = $1
                returning id, hash
            `, [hash, uploaderId, text]);

        let match;
        let artifact;

        for (let type in this.artifactPatters) {
            while ((match = this.artifactPatters[type].exec(text)) !== null) {
                artifact = await this._getArtifact(type, match[0]);

                await this.pool.query(`
                        insert into artifacts_in_content (content_id, artifact_id, "offset", length)
                        values ($1, $2, $3, $4)
                        on conflict do nothing
                    `, [
                        content.rows[0].id, artifact,
                        Array.from(text.substr(0, match.index)).length,
                        Array.from(match[0]).length
                    ]);
            }
        }

        return content.rows[0];
    }

    async _getMedia(buffer, format, size, uploaderId)
    {
        const hash  = await this.hash(buffer);

        const id = await this.pool.query(`
                insert into media (hash, format, uploader_id, size)
                values ($1, $2, $3, $4)
                on conflict (hash) do
                update set hash = $1
                returning id, hash
            `, [
                hash, format, uploaderId, size
            ]);

        return id.rows[0];
    }

    async _getImage(buffer, uploaderId)
    {
        let image = await media.image.get(buffer);
        if (!image)
            return null;

        image.media = await this._getMedia(image.buffer, image.format, image.size, uploaderId);

        await media.image.save(image.buffer, image.media.hash, image.format), image.width, image.height;

        return image;
    }

    async start()
    {
        const sql = fs.readFileSync(path.resolve("db/init.sql"), "utf8").split(';');
        this.pool = new pg.Pool({
            connectionString: config.dbUri,
            max:              1
        });

        this.pool.on("error", async (err, client) => {
            console.error("PostgreSQL pool is down!", err);
            await this.pool.end();
            process.exit(2);
        });

        for (let query of sql) {
            await this.pool.query(query)
                .catch(err => {});
        }
    
        await this.hash("");
        await this.createUser(0, "anon", "Anon", 3828481200)
            .catch(err => {});
    }

    async stop()
    {
        await this.pool.end();
    }

    async restart()
    {
        await this.stop();
        await this.start();
    }

    async hash(data)
    {
        let hash = ""
        let subp = await spawn(path.resolve(config.hashApp));

        return await new Promise((resolve, reject) => {
            subp.stdout.on("data", data => hash += data.toString());
            subp.on("close", () => resolve((new BigInt64Array([hash]))[0]));

            subp.stdin.write(data);
            subp.stdin.end();
        });
    }

    formatDT(datetime)
    {
        const dt = {
            year:    datetime.getFullYear(),
            month:   datetime.getMonth() + 1,
            day :    datetime.getDate(),
            hours:   datetime.getHours(),
            minutes: datetime.getMinutes(),
            seconds: datetime.getSeconds()
        };

        return "" + dt.year + '-'
            + (dt.month   < 10 ? '0' : "") + dt.month   + '-'
            + (dt.day     < 10 ? '0' : "") + dt.day     + ' '
            + (dt.hours   < 10 ? '0' : "") + dt.hours   + ':'
            + (dt.minutes < 10 ? '0' : "") + dt.minutes + ':'
            + (dt.seconds < 10 ? '0' : "") + dt.seconds;
    }

    makeSalt(length)
    {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let   res = [];

        for (let i = 0; i < length; i++) {
            res.push(chars.charAt(Math.floor(
                Math.random() * chars.length
            )));
        }

        return res.join('');
    }

    async hasSession(userId, sessionKey)
    {
        let session = await this.pool.query(
            "select * from sessions where user_id = $1 and key = $2",
            [userId, sessionKey]);

        return session.rows[0] ? true : false;
    }

    async getUser(id)
    {
        const user = await this.pool.query(`
                select id, entity_id, tg_id, tg_username, auth_dt, role, registered_dt, salt
                from ${this.entityTables["user"].account}
                where id = $1
            `, [id]);

        return user.rows[0] ? user.rows[0] : null;
    }

    async getMe(id)
    {
        let user = await this.pool.query(`
                select u.id, u.role, u.registered_dt,
                    up.alias as username, up.searchable, up.friendable, up.invitable,
                    m_c.hash as cover_hash, m_c.format as cover_format,
                    m_a.hash as avatar_hash, m_a.format as avatar_format,
                    c.text as name, u.entity_id
                from ${this.entityTables["user"].account} u
                join ${this.entityTables["user"].profile} up on up.id = u.id
                left join images i_c on i_c.id = up.cover_image_id
                left join media m_c on m_c.id = i_c.media_id
                left join images i_a on i_a.id = up.avatar_image_id
                left join media m_a on m_a.id = i_a.media_id
                join content c on c.id = up.name_id
                where u.id = $1
            `, [id]);

        user = user.rows[0];
        if (!user)
            return null;

        const walls = await this.pool.query(`
                select w.index, c.text as name,
                    w.visibility, w.postable, w.commentable,
                    w.anon_posts_only, w.anon_comments_only,
                    w.sorting, w.bumplimit, w.last_post_index,
                    p.index as pinned_post_index
                from walls w
                join content c
                on c.id = w.name_id
                left join posts p
                on p.id = w.pinned_post_id
                where w.owner_id = $1
            `, [user.entity_id]);

        user.id     = parseInt(user.id);
        user.cover  = user.cover_hash
            ? (new BigUint64Array([user.cover_hash]))[0]  + '.' + user.cover_format
            : null;
        user.avatar = user.avatar_hash
            ? (new BigUint64Array([user.avatar_hash]))[0] + '.' + user.avatar_format
            : null;
        user.walls  = walls.rows;

        user.cover_hash
            = user.cover_format
            = user.avatar_hash
            = user.avatar_format
            = user.entity_id
            = undefined;

        return user;
    }

    async getProfile(entityType, entityId)
    {
        const queries = {
            user: `
                select up.id as id, up.alias as username,
                    up.searchable, up.friendable, up.invitable,
                    m_c.hash as cover_hash, m_c.format as cover_format,
                    m_a.hash as avatar_hash, m_a.format as avatar_format,
                    c.text as name, u.entity_id
                from ${this.entityTables["user"].profile} up
                left join images i_c on i_c.id = up.cover_image_id
                left join media m_c on m_c.id = i_c.media_id
                left join images i_a on i_a.id = up.avatar_image_id
                left join media m_a on m_a.id = i_a.media_id
                join content c on c.id = up.name_id
                join users u on u.id = up.id
                where up.${/^\d+$/.test(entityId) ? "id" : "alias"} = $1
            `,
            club: ``
        };
        let profile = await this.pool.query(queries[entityType], [entityId]);

        profile = profile.rows[0];
        if (!profile)
            return null;

        const walls = await this.pool.query(`
                select w.index, c.text as name,
                    w.visibility, w.postable, w.commentable,
                    w.anon_posts_only, w.anon_comments_only,
                    w.sorting, w.bumplimit, w.last_post_index,
                    pp.index as pinned_post_index, count(p.*) as n_posts
                from walls w
                join content c
                on c.id = w.name_id
                left join posts pp
                on pp.id = w.pinned_post_id
                left join posts p
                on p.wall_id = w.id
                where w.owner_id = $1
                group by w.id, c.id, pp.id
            `, [profile.entity_id]);

        profile.id     = parseInt(profile.id);
        profile.cover  = profile.cover_hash  ? (new BigUint64Array([profile.cover_hash]))[0]  + '.' + profile.cover_format  : null;
        profile.avatar = profile.avatar_hash ? (new BigUint64Array([profile.avatar_hash]))[0] + '.' + profile.avatar_format : null;
        profile.walls  = walls.rows;

        profile.cover_hash
            = profile.cover_format
            = profile.avatar_hash
            = profile.avatar_format
            = profile.entity_id
            = undefined;

        return profile;
    }

    async getProfiles(type, ids)
    {
        const queries = {
            user: `
                select up.id as id, up.alias as username, up.searchable,
                    up.friendable, up.invitable,
                    m_c.hash as cover_hash, m_c.format as cover_format,
                    m_a.hash as avatar_hash, m_a.format as avatar_format,
                    c.text as name
                from ${this.entityTables["user"].profile} up
                left join images i_c on i_c.id = up.cover_image_id
                left join media m_c on m_c.id = i_c.media_id
                left join images i_a on i_a.id = up.avatar_image_id
                left join media m_a on m_a.id = i_a.media_id
                join content c on c.id = up.name_id
                where up.id = any($1::bigint[])
            `,
            club: ``
        };
        let profiles = await this.pool.query(queries[type], [ids]);
        profiles = profiles.rows;

        for (let i in profiles) {
            profiles[i].type   = type;
            profiles[i].id     = parseInt(profiles[i].id);
            profiles[i].cover  = profiles[i].cover_hash
                ? (new BigUint64Array([profiles[i].cover_hash]))[0]  + '.' + profiles[i].cover_format
                : null;
            profiles[i].avatar = profiles[i].avatar_hash
                ? (new BigUint64Array([profiles[i].avatar_hash]))[0] + '.' + profiles[i].avatar_format
                : null;
    
            profiles[i].cover_hash
                = profiles[i].cover_format
                = profiles[i].avatar_hash
                = profiles[i].avatar_format
                = undefined;
        }

        return profiles;
    }

    async getBio(entityType, entityId)
    {
        const bio = await this.pool.query(`
                select c.text from content c
                join ${this.entityTables[entityType].profile} p
                on p.bio_id = c.id
                where p.${/^\d+$/.test(entityId) ? "id" : "alias"} = $1
            `, [entityId]);

        return bio.rows[0] ? bio.rows[0].text : null;
    }

    async getWall(ownerType, ownerId, index)
    {
        const wall = await this.pool.query(`
                select w.id, w.index, c.text as name,
                    w.visibility, w.postable, w.commentable,
                    w.anon_posts_only, w.anon_comments_only,
                    w.sorting, w.bumplimit, w.last_post_index,
                    pp.index as pinned_post_index, count(p.*) as n_posts
                from walls w
                join ${this.entityTables[ownerType].account} u
                on u.entity_id = w.owner_id
                join content c
                on c.id = w.name_id
                left join posts pp
                on pp.id = w.pinned_post_id
                left join posts p
                on p.wall_id = w.id
                where u.id = $1
                and w.index = $2
                group by w.id, c.id, pp.id
            `, [ownerId, index]);

        return wall.rows[0];
    }

    async getRelation(fromType, fromId, toType, toId)
    {
        switch (fromType) {
        case "user":
            switch (toType) {
            case "user":
                let res = {};

                if (fromId == toId) {
                    res.relation       = "me";
                    res.common_friends = res.common_clubs = 0;
                    res.note           = "";
                }
                else {
                    res.relation = await this.pool.query(`
                            select offerer_id, acceptor_id
                            from friends
                            where offerer_id = $1
                            and acceptor_id = $2
                            or acceptor_id = $1
                            and offerer_id = $2
                        `, [
                            fromId, toId
                        ]);

                    if (!res.relation.rows.length) {
                        res.relation = "none";
                    } else if (res.relation.rows.length == 2) {
                        res.relation = "friend";
                    } else if (res.relation.rows[0].offerer_id == toId) {
                        res.relation = "incoming";
                    } else {
                        res.relation = "outcoming";
                    }

                    res.common_friends = await this.pool.query(`
                            select count(*) as count
                            from friends f1
                            join friends f2
                            on f2.offerer_id = f1.acceptor_id
                            and f2.acceptor_id = f1.offerer_id
                            where f1.offerer_id = $1
                            and f1.acceptor_id in (
                                select f1.acceptor_id as id
                                from friends f1
                                join friends f2
                                on f2.offerer_id = f1.acceptor_id
                                and f2.acceptor_id = f1.offerer_id
                                where f1.offerer_id = $2
                            )
                        `, [
                            fromId, toId
                        ]);
                    res.common_friends = parseInt(res.common_friends.rows[0].count);

                    res.common_clubs = 0;

                    res.note = await this.pool.query(`
                            select c.text as note
                            from friends f
                            join content c
                            on c.id = f.note_id
                            where f.offerer_id = $1
                            and f.acceptor_id = $2
                        `, [
                            fromId, toId
                        ]);
                    res.note = res.note.rows[0] ? res.note.rows[0].note : "";
                }

                res.banned = await this.pool.query(`
                        select b.id
                        from blacklist b
                        join users u1
                        on b.issuer_id = u1.entity_id
                        join users u2
                        on b.banned_id = u2.entity_id
                        where u1.id = $1
                        and u2.id = $2
                    `, [
                        fromId, toId
                    ]);
                res.banned = res.banned.rows[0] ? true : false;

                return res;
            break;
            case "club": return null;
            }
        break;
        case "club": return null;
        }
    }

    async getFriends(userId, type)
    {
        const queries = {
            mutual: `
                select f1.acceptor_id as id, f1.since_dt as since_dt, c.text as note
                from friends f1
                join friends f2
                on f2.offerer_id = f1.acceptor_id
                and f2.acceptor_id = f1.offerer_id
                join content c
                on c.id = f1.note_id
                where f1.offerer_id = $1`,
            incoming: `
                select f.offerer_id as id, f.since_dt as since_dt
                from friends f
                where f.acceptor_id = $1
                and f.offerer_id not in (
                    select acceptor_id
                    from friends
                    where offerer_id = $1
                )`,
            outcoming: `
                select f.acceptor_id as id, f.since_dt as since_dt, c.text as note
                from friends f
                join content c
                on c.id = f.note_id
                where f.offerer_id = $1
                and f.acceptor_id not in (
                    select offerer_id
                    from friends
                    where acceptor_id = $1
                )`
        };

        const res = await this.pool.query(queries[type], [userId]);

        return res.rows;
    }

    async getImage(entityType, entityId, albumIndex, hash, format)
    {
        const album = await this.pool.query(`
                select a.id as id from albums a
                join entities e on e.id = a.owner_id
                join ${this.entityTables[entityType].account} u
                on u.entity_id = e.id
                join ${this.entityTables[entityType].profile} p
                on p.id = u.id
                where p.${/^\d+$/.test(entityId) ? "id" : "alias"} = $1
                and a.index = $2
            `, [
                entityId, albumIndex
            ]);
        if (!album.rows[0])
            return null;

        let image = await this.pool.query(`
                select m.hash as hash, m.format as format,
                    m.uploader_id as uploader_id, m.uploaded_dt as uploaded_dt,
                    m.size as size, u.id as owner_user_id, ${/*c.id as owner_club_id,*/""}
                    ct.text as descr, i.saved_dt as saved_dt, i.last_comment_index as last_comment_index,
                    i.width as width, i.height as height
                from media m
                join images i on i.media_id = m.id
                join entities e on e.id = i.owner_id
                left join ${this.entityTables.user.account} u
                on u.entity_id = e.id
                ${/*left join ${this.entityTables.club.account} c
                on c.entity_id = e.id*/""}
                left join content ct on ct.id = i.descr_id
                where i.album_id = $1
                and m.hash = $2
                and m.format = $3
            `, [
                album.rows[0].id, (new BigInt64Array([hash]))[0], format
            ]);

        image = image.rows[0];
        if (!image)
            return null;

        image.owner = image.owner_user_id
            ? "user/" + image.owner_user_id
            : "club/" + image.owner_club_id;
        delete image.owner_user_id;
        delete image.owner_club_id;

        return image;
    }

    async getPosts(wallId, sorting, offset, limit)
    {
        const orderBy = {
            datetime:         "sent_dt",
            datetime_reverse: "sent_dt desc"
        };

        let posts = await this.pool.query(`
                select p.index, u.id as author_user_id, ${/*c.id as club_user_id,*/""}
                c.text, p.sent_dt, p.commentable, p.anon_comments_only,
                p.last_comment_index, p.poll_id, p.repost_id
                from posts p
                join content c
                on c.id = p.text_id
                left join users u
                on u.entity_id = p.author_id
                ${/*left join clubs c
                on c.entity_id = p.author_id*/""}
                where p.wall_id = $1
                and p.sent_dt <= current_timestamp
                order by ${orderBy[sorting]}
                offset $2
                limit $3
            `, [
                wallId, offset, limit
            ]);
        posts = posts.rows;

        for (let i = 0; i < posts.length; i++) {
            posts[i].author = posts[i].author_user_id
                ? "user/" + posts[i].author_user_id
                : "club/" + posts[i].author_club_id;

            delete posts[i].author_user_id;
            delete posts[i].author_club_id;
            delete posts[i].poll_id;
            delete posts[i].repost_id;
        }

        return posts;
    }

    async authUser(id, authDT, sessionKey, ip, useragent)
    {
        authDT = new Date(authDT * 1000).toUTCString();
        await this.pool.query(
            "update users set auth_dt = $1 where id = $2",
            [authDT, id]);

        const useragentId = await this._getContent(useragent, 0);

        let session = sessionKey
            && ( await this.pool.query(
                "select key from sessions where user_id = $1 and key = $2",
                [id, sessionKey]
            )).rows[0];

        if (session) {
            await this.pool.query(`
                    update sessions
                    set ip = $1, auth_dt = $2, useragent_id = $3
                    where user_id = $4
                `, [
                    ip, authDT, useragentId.id, id
                ]);

            return session.key;
        }

        session = uuidv4();
        await this.pool.query(`
                insert into sessions
                (user_id, key, ip, auth_dt, useragent_id)
                values ($1, $2, $3, $4, $5)
            `, [
                id, session, ip, authDT, useragentId.id
            ]);

        return session;
    }

    async createUser(id, username, name, authDT, avatar)
    {
        const entityId = await this.pool.query("insert into entities default values returning id");

        await this.pool.query(`
                insert into ${this.entityTables["user"].account}
                (id, entity_id, tg_id, tg_username, auth_dt, salt)
                values ($1, $2, $3, $4, $5, $6)
            `, [
                id, entityId.rows[0].id, id, username,
                new Date(authDT * 1000).toUTCString(), this.makeSalt(32)
            ]);

        await this.pool.query(`
                insert into albums (owner_id, index)
                values ($1, $2)
            `, [
                entityId.rows[0].id, 0
            ]);

        const nameId   = await this._getContent(name, 0);
        const avatarId = avatar 
            ? await this.addImage(avatar, "user", id, "user", id, 0, null, id)
            : null;

        await this.pool.query(`
                insert into ${this.entityTables["user"].profile}
                (id, cover_image_id, avatar_image_id, name_id)
                values ($1, $2, $3, $4)
            `, [
                id, null, avatarId, nameId.id
            ]);

        await this.pool.query(`
                insert into walls (owner_id, index, name_id)
                values ($1, $2, $3)
            `, [
                entityId.rows[0].id, 0, 1
            ]);
    }

    async destroySession(userId, key)
    {
        await this.pool.query(
            "delete from sessions where user_id = $1 and key = $2",
            [userId, key]);
    }

    async friend(offererId, acceptorId)
    {
        const target = await this.pool.query("select id from users where id = $1", [acceptorId]);
        if (!target.rows[0])
            return null;

        const friendship = await this.pool.query(`
                insert into friends (offerer_id, acceptor_id)
                values ($1, $2)
                on conflict (offerer_id, acceptor_id) do
                update set offerer_id = $1
                returning id, since_dt
            `, [
                offererId, acceptorId
            ]);

        return friendship.rows[0];
    }

    async unfriend(offererId, acceptorId)
    {
        const friendship = await this.pool.query(`
                select id, since_dt
                from friends
                where offerer_id = $1
                and acceptor_id = $2
            `, [
                offererId, acceptorId
            ]);

        if (!friendship.rows[0])
            return null;

        await this.pool.query(`
                delete from friends
                where id = $1
            `, [friendship.rows[0].id]);

        return friendship.rows[0];
    }

    async noteFriend(userId, friendId, text)
    {
        const note = await this._getContent(text, userId);

        const friendship = await this.pool.query(`
                update friends
                set note_id = $1
                where offerer_id = $2
                and acceptor_id = $3
                returning id
            `, [
                note.id, userId, friendId
            ]);

        return friendship.rows[0] ? friendship.rows[0].id : null;
    }

    async setAvatar(entityType, entityId, hash, format)
    {
        if (!hash && !format) {
            await this.pool.query(`
                    update ${this.entityTables[entityType].profile} p
                    set avatar_id = null
                    where p.id = $1
                `, [entityId]);

            return true;
        }

        const imageId = await this.pool.query(`
                select i.id as id
                from images i
                join albums a on a.id = i.album_id
                join entities e on e.id = a.owner_id
                join ${this.entityTables[entityType].account} u on u.entity_id = e.id
                join media m on m.id = i.media_id
                where u.id = $1
                and a.index = 0
                and m.hash = $2
                and m.format = $3
            `, [
                entityId, (new BigInt64Array([hash]))[0], format
            ]);
        if (!image.rows[0])
            return false;

        await this.pool.query(`
                update ${this.entityTables[entityType].profile} p
                set avatar_id = $1
                where p.id = $2
            `, [
                image.rows[0].id, entityId
            ]);

        return true;
    }

    async setAlias(entityType, entityId, alias)
    {
        if (alias) {
            await this.pool.query(`
                    update ${this.entityTables[entityType].profile}
                    set alias = $1
                    where id = $2
                    returning id`,
                [alias, entityId]);

            return true;
        }

        const id = await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set alias = null where id = $1
                on conflict do nothing
                returning id`,
            [entityId]);

        return id.rows[0] ? true : false;
    }

    async setName(entityType, entityId, name, userId)
    {
        const nameId = await this._getContent(name, userId);

        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set name_id = $1
                where id = $2`,
            [nameId.id, entityId]);
    }

    async setBio(entityType, entityId, bio, userId)
    {
        const bioId = await this._getContent(bio, userId)

        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set bio_id = $1
                where id = $2`,
            [bioId.id, entityId]);
    }

    async setPrivacy(entityType, entityId, option, value)
    {
        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set ${option} = $1
                where id = $2`,
            [value, entityId]);
    }

    async post(wallId, authorType, authorId, text, schedule,
        commentable, anon_comments_only, pollId, repostId, userId)
    {
        const author = await this.pool.query(`
                select entity_id as id
                from ${this.entityTables[authorType].account}
                where id = $1
            `, [authorId]);
        if (!author.rows[0])
            return null;

        const index = await this.pool.query(`
                update walls
                set last_post_index = last_post_index + 1
                where id = $1
                returning last_post_index
            `, [wallId]);

        text = await this._getContent(text, userId);

        if (!schedule) {
            schedule = "2019-04-27 03:00:00";
        }

        const post = await this.pool.query(`
                insert into posts (
                    wall_id, index, author_id, text_id, sent_dt,
                    commentable, anon_comments_only, poll_id, repost_id
                )
                values ($1, $2, $3, $4, (
                    select $5 as dt
                    union
                    select current_timestamp as dt
                    order by dt desc
                    limit 1
                ), $6, $7, $8, $9)
                returning id, index, sent_dt
            `, [
                wallId, index.rows[0].last_post_index, author.rows[0].id, text.id,
                schedule, commentable, anon_comments_only, pollId, repostId
            ]);

        return post.rows[0] || null;
    }

    async addImage(buffer, ownerType, ownerId, albumOwnerType, albumOwnerId, albumIndex, descr, uploaderId)
    {
        const album = await this.pool.query(`
                select a.id as id
                from albums a
                join entities e on e.id = a.owner_id
                join ${this.entityTables[albumOwnerType].account} u on u.entity_id = e.id
                where u.id = $1
                and a.index = $2
            `, [
                albumOwnerId, albumIndex
            ]);

        if (!album.rows[0])
            return null;

        const data    = await this._getImage(buffer, uploaderId);
        const descrId = descr ? await this._getContent(descr, uploaderId) : 1;
        if (!data)
            return null;

        const image = await this.pool.query(`
                insert into images (album_id, media_id, owner_id, descr_id, width, height)
                values ($1, $2, (select entity_id from ${this.entityTables[ownerType].account} where id = $3), $4, $5, $6)
                returning id
            `, [
                album.rows[0].id, data.media.id, ownerId, descrId, data.width, data.height
            ]);

        return image.rows[0].id;
    }
}

module.exports = new DBHelper();
