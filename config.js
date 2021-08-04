module.exports = {
    port: process.env.PORT || 8080,
    bot: {
        token: process.env.BOT_TOKEN
    },
    dbUri:   process.env.DBURI,
    hashApp: process.env.HASH_APP || "./hash"
}
