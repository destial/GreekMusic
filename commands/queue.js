const { Guild, Message, MessageEmbed } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const getVideoLink = require('../utils/getVideoLink');
const decorateEmbed = require('../utils/decorateEmbed');

module.exports = {
    aliases: ['q', 'playlist', 'pl'],
    description: 'Add a song to the queue / playlist',
    usage: '[ query ]',
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     * * @param {string} cmd
     */
    async run(guild, message, args, cmd) {
        const connection = getVoiceConnection(guild.id);
        if (!args.length) {
            if (!connection || !connection.link) {
                const embed = new MessageEmbed().setColor('RED');
                embed.setAuthor('I am not playing anything!');
                embed.setDescription(`Play a song via ${"`" + guild.prefix + cmd + " [ query ]`"}`);
                return message.channel.send({ embeds: [embed] });
            }
            const embed = new MessageEmbed().setColor('BLUE');
            embed.addField(`Currently Playing`, `[${connection.link.title}](${connection.link.url})`, false);
            var i = 0;
            for (const link of connection.queue) {
                if (i > 24) break;
                embed.addField(`${++i}. ${link.author}`, `[${link.title}](${link.url})`, false);
            }
            return message.channel.send({ embeds: [embed] });
        }
        if (!connection || (!connection.queue.length && !connection.link)) 
            return guild.client.commands.get('play').run(guild, message, args, cmd);
        
        const link = await getVideoLink(args.join(' '));
        if (!link) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setTitle(`No results found!`);
            return message.channel.send({ embeds: [embed] });
        }
        connection.queue.push(link);
        const embed = new MessageEmbed().setColor('GREEN');
        decorateEmbed(`Added to Queue`, embed, link);
        return message.channel.send({ embeds: [embed] });
    }
}