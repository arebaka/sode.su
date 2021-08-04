const path   = require("path");
const fs     = require("fs");
const crypto = require("crypto");
const pg     = require("pg");

const { spawn }      = require("child_process");
const { v4: uuidv4 } = require("uuid");

const config = require("../config");

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
            number: /[+–-]?([0-9]*\.)?[0-9]+/g
        };
    }

    async _getHash(data)
    {
        let hash = ""
        let subp = await spawn(path.resolve(config.hashApp));

        return await new Promise((resolve, reject) => {
            subp.stdout.on("data", data => hash += data.toString());
            subp.on("close", () => resolve((new BigInt64Array([hash]))[0]));

            if (typeof data == "string") {
                subp.stdin.write(data);
            }
            subp.stdin.end();
        });
    }

    async _getArtifact(type, string)
    {
        const hash = await this._getHash(string);

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

        return artifact.rows[0].id;
    }

    async _getContent(text, uploaderId)
    {
        const hash = await this._getHash(text);

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
                        on conflict (content_id, artifact_id, "offset", length) do nothing
                    `, [
                        content.rows[0].id, artifact,
                        Array.from(text.substr(0, match.index)).length,
                        Array.from(match[0]).length
                    ]);
            }
        }

        return content.rows[0];
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
    
        await this._getHash("");
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
                    up.alias as username, up.searchable, up.friendable, up.invitable, up.commentable,
                    up.anon_comments_only, up.last_post_index, up.pinned_post_index,
                    m_c.hash as cover_hash, m_c.format as cover_format,
                    m_a.hash as avatar_hash, m_a.format as avatar_format,
                    c.text as name
                from ${this.entityTables["user"].account} u
                join ${this.entityTables["user"].profile} up on up.id = u.id
                left join images i_c on i_c.id = up.cover_image_id
                left join media m_c on m_c.id = i_c.media_id
                left join images i_a on i_a.id = up.cover_image_id
                left join media m_a on m_a.id = i_a.media_id
                join content c on c.id = up.name_id
                where u.id = $1
            `, [id]);

        user = user.rows[0];
        if (!user)
            return null;

        user.cover  = user.cover_hash  ? user.cover_hash  + '.' + user.cover_format  : null;
        user.avatar = user.avatar_hash ? user.avatar_hash + '.' + user.avatar_format : null;

        return user;
    }

    async getProfile(entityType, entityId)
    {
        const queries = {
            user: `
                select up.alias as username, up.searchable, up.friendable, up.invitable, up.commentable,
                    up.anon_comments_only, up.last_post_index, up.pinned_post_index,
                    m_c.hash as cover_hash, m_c.format as cover_format,
                    m_a.hash as avatar_hash, m_a.format as avatar_format,
                    c.text as name
                from ${this.entityTables["user"].profile} up
                left join images i_c on i_c.id = up.cover_image_id
                left join media m_c on m_c.id = i_c.media_id
                left join images i_a on i_a.id = up.cover_image_id
                left join media m_a on m_a.id = i_a.media_id
                join content c on c.id = up.name_id
                where up.${/^\d+$/.test(entityId) ? "id" : "alias"} = $1
            `,
            club: ``
        };
        let profile = await this.pool.query(queries[entityType], [entityId]);

        profile = profile.rows[0];
        if (!profile)
            return null;

        profile.cover  = profile.cover_hash  ? profile.cover_hash  + '.' + profile.cover_format  : null;
        profile.avatar = profile.avatar_hash ? profile.avatar_hash + '.' + profile.avatar_format : null;

        return profile;
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

    async createUser(id, username, name, authDT)
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
                insert into ${this.entityTables["user"].profile}
                (id, cover_image_id, avatar_image_id, name_id)
                values ($1, $2, $3, $4)
            `, [
                id, null, null, name
            ]);
    }

    async destroySession(userId, key)
    {
        await this.pool.query(
            "delete from sessions where user_id = $1 and key = $2",
            [userId, key]);
    }

    async setAlias(entityType, entityId, alias)
    {
        alias
            ? await this.pool.query(`
                    update ${this.entityTables[entityType].profile}
                    set alias = $1 where id = $2`,
                [alias, entityId])
            : await this.pool.query(`
                    update ${this.entityTables[entityType].profile}
                    set alias = null where id = $1`,
                [entityId]);
    }

    async setName(entityType, entityId, name, userId)
    {console.log(userId);
        const nameId = await this._getContent(name, userId);

        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set name_id = $1 where id = $2`,
            [nameId.id, entityId]);
    }

    async setBio(entityType, entityId, bio, userId)
    {
        const bioId = await this._getContent(bio, userId)

        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set bio_id = $1 where id = $2`,
            [
                bioId.id, entityId
            ]);
    }

    async setPrivacy(entityType, entityId, option, value)
    {
        await this.pool.query(`
                update ${this.entityTables[entityType].profile}
                set ${option} = $1 where id = $2`,
            [value, entityId]);
    }
}

module.exports = new DBHelper();
