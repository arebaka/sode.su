module.exports = {
    port:      process.env.PORT || 8080,
    bot: {
        token: process.env.BOT_TOKEN
    },
    db: {
        host:     process.env.DBHOST     || "localhost",
        user:     process.env.DBUSER     || null,
        password: process.env.DBPASSWORD || null,
        database: process.env.DBDATABASE,
        port:     process.env.DBPORT     || 5432
    }
}
