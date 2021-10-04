const { getVoiceConnection } = require('@discordjs/voice');
const { Guild, Message, MessageEmbed } = require('discord.js');

module.exports = {
    aliases: ['unpause'],
    description: 'Pauses the currently playing song',
    usage: '',
    /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd
     */
    async run(guild, message, args, cmd) {
        const connection = getVoiceConnection(guild.id);
        if (!connection) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('I am not playing anything!');
            embed.setDescription(`Play a song via ${"`" + guild.prefix + "play [ query ]`"}`);
            return message.channel.send({ embeds: [embed] });
        }
        if (connection.player) {
            cmd === "pause" ? connection.player.pause() : connection.player.unpause();
            const embed = new MessageEmbed().setColor('ORANGE');
            embed.setAuthor(cmd === "pause" ? `Paused` : `Resumed`);
            embed.addField(connection.link.author, `[${connection.link.title}](${connection.link.url})`);
            return message.channel.send({ embeds: [embed] });
        }
    }
}