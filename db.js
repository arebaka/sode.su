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
}

module.exports = new DBHelper();
