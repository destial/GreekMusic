const { Guild, Message, MessageEmbed } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
module.exports = {
    description: 'Shuffle the current queue / playlist',
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
        if (!connection.queue.length) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('The queue is empty!');
            embed.setDescription(`Play a song via ${"`" + guild.prefix + "play [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        shuffle(connection.queue);
        const embed = new MessageEmbed().setColor('BLUE');
        embed.addField(`Currently Playing`, `[${connection.link.title}](${connection.link.url})`, false);
        var i = 0;
        for (const queue of connection.queue) {
            if (i > 24) break;
            embed.addField(`${++i}. ${queue.author}`, `[${queue.title}](${queue.url})`, false);
        }
        return message.channel.send({ embeds: [embed] });
    }
}