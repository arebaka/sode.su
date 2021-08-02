const crypto = require("crypto");
const pg     = require("pg");

const { spawn }      = require("child_process");
const { v4: uuidv4 } = require("uuid");

const config = require("./config");

const entityTables = {
    user: {
        account: "users",
        profile: "user_profiles"
    },
    club: {
        account: "clubs",
        profile: "club_profiles"
    }
};

class DBHelper
{
    constructor()
    {
        this.pool = null;

        this.tgSecretKey = crypto
            .createHash("sha256")
            .update(config.bot.token)
            .digest();
    }

    async _getHash(data)
    {
        let hash = ""
        let subp = await spawn("./hash");

        return await new Promise((resolve, reject) => {
            subp.stdout.on("data", data => hash += data.toString());
            subp.on("close", () => resolve((new BigInt64Array([hash]))[0]));

            subp.stdin.write(data);
            subp.stdin.end();
        });
    }

    async _getContent(text)
    {
        const hash = await this._getHash(text);

        let content = await this.pool.query(`
                insert into content (hash, text)
                values ($1, $2)
                on conflict (hash) do
                update set hash = $1
                returning id, hash
            `, [hash, text]);

        return content.rows[0] ? content.rows[0] : null;
    }

    async start()
    {
        this.pool = new pg.Pool({
            host:     config.db.host,
            user:     config.db.user,
            password: config.db.password,
            database: config.db.database,
            port:     config.db.port,
            max:      1
        });

        this.pool.on("error", async (err, client) => {
            console.error("PostgreSQL pool is down!", err);
            await this.pool.end();
            process.exit(-1);
        });
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
                select * from ${entityTables["user"].account}
                where id = $1
            `, [id]);

        return user.rows[0] ? user.rows[0] : null;
    }

    async getMe(id)
    {
        let user = await this.pool.query(`
                select u.role, u.registered_dt, up.* from ${entityTables["user"].account} u
                join ${entityTables["user"].profile} up on up.id = u.id
                where u.id = $1
            `, [id]);

        user = user.rows[0];
        if (!user)
            return null;

        user.username = user.alias;
        user.alias = undefined;
        user.bio_id = undefined;

        return user;
    }

    async getProfile(entityType, entityId)
    {
        let profile = await this.pool.query(`
                select * from ${entityTables[entityType].profile}
                where ${isNaN(entityId) ? "alias" : "id"} = $1
            `, [entityId]);

        profile = profile.rows[0];
        if (!profile)
            return null;

        profile.username = profile.alias;
        profile.alias = undefined;
        profile.bio_id = undefined;

        return profile;
    }

    async getBio(entityType, entityId)
    {
        const bio = await this.pool.query(`
                select c.text from content c
                join ${entityTables[entityType].profile} p on p.bio_id = c.id
                where p.${isNaN(entityId) ? "alias" : "id"} = $1
            `, [entityId]);

        return bio.rows[0] ? bio.rows[0].text : null;
    }

    async authUser(id, authDT, sessionKey, ip, useragent)
    {
        authDT = new Date(authDT * 1000).toUTCString();
        await this.pool.query(
            "update users set auth_dt = $1 where id = $2",
            [authDT, id]);

        let session;

        if (sessionKey) {
            session = await this.pool.query(
                "select key from sessions where user_id = $1 and key = $2",
                [id, sessionKey]);
            session = session.rows[0];
        }
        else {
            session = null;
        }

        if (session) {
            await this.pool.query(`
                    update sessions
                    set ip = $1, auth_dt = $2, useragent = $3
                    where user_id = $4
                `, [
                    ip, authDT, useragent, id
                ]);

            return session.key;
        }

        session = uuidv4();
        await this.pool.query(`
                insert into sessions (user_id, key, ip, auth_dt, useragent)
                values ($1, $2, $3, $4, $5)
            `, [
                id, session, ip, authDT, useragent
            ]);

        return session;
    }

    async createUser(id, username, name, authDT)
    {
        const entityId = await this.pool.query("insert into entities default values returning id");

        await this.pool.query(`
                insert into ${entityTables["user"].account}
                (id, entity_id, tg_id, tg_username, auth_dt, salt)
                values ($1, $2, $3, $4, $5, $6)
            `, [
                id, entityId.rows[0].id, id, username, new Date(authDT * 1000).toUTCString(), this.makeSalt(32)
            ]);

        await this.pool.query(`
                insert into ${entityTables["user"].profile}
                (id, cover_image_id, avatar_image_id, bio_id, name)
                values ($1, $2, $3, $4, $5)
            `, [
                id, null, null, 1, name
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
                    update ${entityTables[entityType].profile}
                    set alias = $1 where id = $2`,
                [alias, entityId])
            : await this.pool.query(`
                    update ${entityTables[entityType].profile}
                    set alias = null where id = $1`,
                [entityId]);
    }

    async setName(entityType, entityId, name)
    {
        await this.pool.query(`
                update ${entityTables[entityType].profile}
                set name = $1 where id = $2`,
            [name, entityId]);
    }

    async setBio(entityType, entityId, bio)
    {
        bio
            ? await this.pool.query(`
                    update ${entityTables[entityType].profile}
                    set bio_id = $1 where id = $2`,
                [
                    (await this._getContent(bio)).id, entityId
                ])
            : await this.pool.query(`
                    update ${entityTables[entityType].profile}
                    set bio_id = 1 where id = $1
                `, [entityId]);
    }

    async setPrivacy(entityType, entityId, option, value)
    {
        await this.pool.query(`
                update ${entityTables[entityType].profile}
                set ${option} = $1 where id = $2`,
            [value, entityId]);
    }
}

module.exports = new DBHelper();
