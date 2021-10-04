const { getVoiceConnection } = require('@discordjs/voice');
const { Guild, Message, MessageEmbed } = require('discord.js');

module.exports = {
    aliases: ['stop', 'quit'],
    description: 'Disconnect the player from the channel',
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
        connection.player.stop();
        connection.destroy();
        connection.queue = [];
        if (guild.me.voice.timer) clearInterval(guild.me.voice.timer);
        guild.me.voice.timer = null;
        const embed = new MessageEmbed().setColor('BLUE');
        embed.setAuthor('Disconnected from Voice');
        return message.channel.send({ embeds: [embed] });
    }
}