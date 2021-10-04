const { Guild, Message, MessageEmbed } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    description: 'Set the queue / playlist on repeat',
    usage: '',
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     */
    async run(guild, message) {
        const connection = getVoiceConnection(guild.id);
        if (!connection) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('I am not playing anything!');
            embed.setDescription(`Play a song via ${"`" + guild.prefix + "play [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        if (!connection.link) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('I am not playing anything!');
            embed.setDescription(`Play a song via ${"`" + guild.prefix + "play [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        if (!connection.queue.length) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('The queue is empty!');
            embed.setDescription(`Queue a song via ${"`" + guild.prefix + "queue [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        connection.repeat = !connection.repeat;
        if (connection.repeat)
            connection.queue.push(connection.link);
        const embed = new MessageEmbed().setColor('GREEN');
        embed.setAuthor(connection.repeat ? `Repeating playlist` : `Stopped repeating playlist`);
        var i = 0;
        for (const queue of connection.queue) {
            if (i > 24) break;
            embed.addField(`${++i}. ${queue.author}`, `[${queue.title}](${queue.url})`, false);
        }
        return message.channel.send({ embeds: [embed] });
    }
}