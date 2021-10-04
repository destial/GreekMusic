const { Guild, Message, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    description: 'Start a watchalong with your friends!',
    usage: '',
    aliases: ['yt', 'youtube'],
   /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     */
    async run(guild, message) {
        const { voice } = message.member;
        if (!voice.channelId) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('You are not in a voice channel!');
            embed.setDescription(`Join a voice channel!`);
            return message.channel.send({ embeds: [embed] });
        }
        fetch(`https://discord.com/api/v8/channels/${voice.channelId}/invites`, {
            method: "POST",
            body: JSON.stringify({
                max_age: 86400,
                max_uses: 0,
                target_application_id: "755600276941176913",
                target_type: 2,
                temporary: false,
                validate: null
            }),
            headers: {
                "Authorization": `Bot ${message.client.token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(invite => {
            const embed = new MessageEmbed();
            embed.setAuthor('Youtube Watchalong Party Started!');
            embed.setDescription(`[Click to join!](https://discord.gg/${invite.code})`);
            embed.setColor('RED');
            message.channel.send({ embeds: [embed] });
        });
    }
}