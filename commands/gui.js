const { Guild, Message, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    aliases: ['g'],
    description: 'Simple GUI to handle playing of songs',
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
        const gui = new MessageEmbed().setColor('BLUE');
        if (connection.link) {
            gui.addField(`Currently Playing`, `[${connection.link.title}](${connection.link.url})`, false);
            gui.setThumbnail(connection.link.thumbnail);
        } else {
            gui.addField('Not Playing Anything', 'Queue a song!', false);
        }
        var i = 0;
        for (const link of connection.queue) {
            if (i > 5) break;
            gui.addField(`${++i}. ${link.author}`, `[${link.title}](${link.url})`, false);
        }
        gui.setFooter(`Only showing the top 5 songs in the queue!`);
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('play')
                .setStyle('PRIMARY')
                .setDisabled(false)
                .setEmoji('▶️'),
            new MessageButton()
                .setCustomId('pause')
                .setStyle('PRIMARY')
                .setDisabled(false)
                .setEmoji('⏸️'),
            new MessageButton()
                .setCustomId('skip')
                .setStyle('PRIMARY')
                .setDisabled(false)
                .setEmoji('⏩'),
        );
        message.channel.send({ embeds: [gui], components: [row] });
    }
}