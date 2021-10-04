const { Guild, Message, MessageEmbed } = require('discord.js');

module.exports = {
    aliases: ['setprefix'],
    description: 'Set the prefix of the bot',
    usage: '[ prefix ]',
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     */
    async run(guild, message, args) {
        const { member } = message;
        if (!member.permissions.has('MANAGE_CHANNELS')) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('You do not have permission!');
            return message.channel.send({ embeds: [embed] });
        }
        const newPrefix = args[0];
        if (!newPrefix) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('Please provide a prefix!');
            return message.channel.send({ embeds: [embed] });
        }
        guild.prefix = newPrefix.trim();
        guild.client.db.run('UPDATE guilds SET prefix=(?) WHERE id=(?)', [guild.prefix, guild.id]);
        const embed = new MessageEmbed().setColor('GREEN');
        embed.setAuthor(`Successfully set the new prefix to be: ${guild.prefix}`);
        return message.channel.send({ embeds: [embed] });
    }
}