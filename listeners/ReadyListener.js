const { Client } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.once('ready', () => {
            client.user.setActivity({ type: 'LISTENING', name: 'Hey Greek'});
            console.log('Greekbot is up!');
        });
    }
}