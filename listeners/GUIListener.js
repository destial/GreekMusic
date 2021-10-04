const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const { Client } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.on('interactionCreate', async (i) => {
            if (!i.isButton()) return;
            i.deferUpdate();
            const connection = getVoiceConnection(i.guild.id);
            if (!connection || !connection.player) return;
            switch (i.customId) {
                case 'play': {
                    connection.player.unpause();
                    break;
                }
                case 'pause': {
                    connection.player.pause();
                    break;
                }
                case 'skip': {
                    const queue = connection.queue.shift();
                    connection.player.play(createAudioResource(queue.resource));
                    if (connection.repeat) {           
                        connection.queue.push(queue);
                    }
                    connection.link = queue;
                    break;
                }
                default: break;
            }
        });
    }
}