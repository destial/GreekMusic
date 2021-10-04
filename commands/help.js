const { MessageEmbed } = require('discord.js');

module.exports = {
    aliases: ['h'],
    description: 'Show the help command',
    usage: '',
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd
     */
    async run(guild, message, args, cmd) {
        const embed = new MessageEmbed().setColor('GREEN');
        if (!guild.prefix) {
            return guild.client.db.all(`SELECT * FROM guilds WHERE id=(?)`, [guild.id], (err, rows) => {
                if (err) throw err;
                if (!rows.length) {
                    return guild.client.db.run(`REPLACE INTO guilds (id,prefix) VALUES (?,?)`, [guild.id, '-'], (err) => {
                        if (err) throw err;
                        guild.prefix = '-';
                        return this.run(guild, message, args, cmd);
                    });
                }
                guild.prefix = rows[0].prefix;
                return this.run(guild, message, args, cmd);
            });
        }
        embed.setTitle(`Here are my commands: (Prefix: ${guild.prefix})`);
        embed.setDescription('You can also activate me by saying `Hey Greek`');
        const cmdObjects = [];
        for (const [ name, object ] of guild.client.commands) {
            if (cmdObjects.includes(object)) continue;
            cmdObjects.push(object);
            const aliases = object.aliases ? object.aliases.join(', ') : 'None'
            embed.addField(`${name} ${object.usage}`, `${object.description}\n*Aliases: ${aliases}*`, true);
        }
        embed.setFooter('Privately developed, do not share!')
        return message.channel.send({ embeds: [embed] });
    }
}