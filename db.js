const crypto = require("crypto");
const pg     = require("pg");

const entityTables = {
    "user": {
        account: "users",
        profile: "user_profiles"
    },
    "club": {
        account: "clubs",
        profile: "club_profiles"
    }
};

class DBHelper
{
    constructor()
    {
        this.pool = null;

        this.params = {
            host:     process.env.DBHOST || "localhost",
            user:     process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBDATABASE,
            port:     process.env.DBPORT || 5432,
            max:      1
        };

        this.tgSecretKey = crypto
            .createHash("sha256")
            .update(process.env.BOT_TOKEN)
            .digest();
    }

    async start()
    {
        this.pool = new pg.Pool(this.params);

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

    async getUser(id) {
        let user = await this.pool.query(`
                select * from ${entityTables["user"].account}
                where id = $1
            `, [
                id
            ]);

        user = user.rows[0];
        if (!user)
            return null;

        return user;
    }

    async getProfile(entityType, entityId)
    {
        let profile = await this.pool.query(`
                select * from ${entityTables[entityType].profile}
                where ${isNaN(entityId) ? "alias" : "id"} = $1
            `, [
                entityId
            ]);

        profile = profile.rows[0];
        if (!profile)
            return null;

        profile.bio_id = undefined;
        return profile;
    }

    async getBio(entityType, entityId)
    {
        let bio = await this.pool.query(`
                select c.text from content c
                join ${entityTables[entityType].profile} p on p.bio_id = c.id
                where p.${isNaN(entityId) ? "alias" : "id"} = $1
            `, [
                entityId
            ]);

        bio = bio.rows[0];
        if (!bio)
            return null;

        return bio.text;
    }

    async createUser(id, username, name, authDT)
    {
        await this.pool.query("insert into entities default values");

        let entityId = await this.pool.query("select last_value from entities_id_seq");
        entityId = entityId.rows[0].last_value;

        await this.pool.query(`
                insert into ${entityTables["user"].account} (id, entity_id, tg_id, tg_username, auth_dt, salt)
                values ($1, $2, $3, $4, $5, $6)
            `, [
                id, entityId, id, username, new Date(authDT * 1000).toUTCString(), this.makeSalt(32)
            ]);

        await this.pool.query(`
                insert into ${entityTables["user"].profile} (id, alias, cover_image_id, avatar_image_id, bio_id, name)
                values ($1, $2, $3, $4, $5, $6)
            `, [
                id, username, null, null, 1, name
            ]);
    }
}

module.exports = new DBHelper();
