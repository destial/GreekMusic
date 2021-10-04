const { Guild, Message, MessageEmbed } = require('discord.js');
const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const decorateEmbed = require('../utils/decorateEmbed');

module.exports = {
    description: 'Skips the current song to the next one in the queue / playlist',
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
            embed.setDescription(`Queue a song via ${"`" + guild.prefix + "queue [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        const queue = connection.queue.shift();
        connection.player.play(createAudioResource(queue.resource));
        if (connection.repeat) {           
            connection.queue.push(queue);
        }
        connection.link = queue;
        const embed = new MessageEmbed().setColor('GREEN');
        decorateEmbed(`Now Playing`, embed, queue);
        return message.channel.send({ embeds: [embed] });
    }
}