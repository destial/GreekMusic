const { Client } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.on('guildCreate', (guild) => {
            client.db.run(`REPLACE INTO guilds (id,prefix) VALUES (?,?)`, [guild.id, '-'], (err) => {
                if (err) throw err;
                guild.prefix = '-';
            });
        });
    }
}