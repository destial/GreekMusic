const { Client } = require('discord.js');
const { processCommand } = require('../utils/commands');

module.exports = {
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.on('messageCreate', async (message) => {
            if (!message.guild) return;
            if (message.author.bot) return;
            const { guild } = message;
            if (message.mentions.members.has(guild.me.id)) {
                return client.commands.get('help').run(guild, message);
            }
            if (!guild.prefix) {
                return client.db.all(`SELECT * FROM guilds WHERE id=(?)`, [guild.id], (err, rows) => {
                    if (err) throw err;
                    if (!rows.length) {
                        return client.db.run(`REPLACE INTO guilds (id,prefix) VALUES (?,?)`, [guild.id, '-'], (err) => {
                            if (err) throw err;
                            guild.prefix = '-';
                            return processCommand(message);
                        });
                    }
                    guild.prefix = rows[0].prefix;
                    return processCommand(message);
                });
            }
            return processCommand(message);
        });
    }
}