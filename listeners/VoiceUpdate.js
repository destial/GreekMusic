const { Client } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.on('voiceStateUpdate', (o, n) => {
            if (n.member.id !== n.guild.me.id) return;
            if (o.serverDeaf !== n.serverDeaf) {
                try {
                    n.guild.me.voice.setDeaf(true);
                } catch(err) {}
            }
        });
    }
}