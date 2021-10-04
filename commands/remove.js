const { Guild, Message, MessageEmbed } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const decorateEmbed = require('../utils/decorateEmbed');

module.exports = {
    aliases: ['r'],
    description: 'Remove a song from the queue / playlist',
    usage: '[ index ]',
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     */
    async run(guild, message, args) {
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
        if (!args.length) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('Please provide the queue number of the song to remove!');
            embed.setDescription(`Check the queue via ${"`" + guild.prefix + "queue`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        const index = Number(args[0]);
        if (index > connection.queue.length || index < 1) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('That number is not part of the queue!');
            embed.setDescription(`Check the queue via ${"`" + guild.prefix + "queue`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        const queue = connection.queue.splice(index - 1, 1)[0];
        const embed = new MessageEmbed().setColor('GREEN');
        decorateEmbed(`Removed from the Queue`, embed, queue);
        return message.channel.send({ embeds: [embed] });
    }
}