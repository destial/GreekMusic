const { MessageEmbed } = require('discord.js');
const { AudioPlayerStatus, VoiceConnectionStatus, createAudioResource } = require('@discordjs/voice');
const decorateEmbed = require('../utils/decorateEmbed');
const { parentPort } = require('worker_threads');

parentPort.on('message', object => {
    console.log(object);
    if (object.type === 'play') {
        object.player.on('error', (err) => {
            console.log(err.message);
            const embed = new MessageEmbed().setColor('RED');
            embed.setTitle('An error has occured while playing');
            embed.setDescription('Probably internet bad.');
            message.channel.send({ embeds: [embed] });
            // connection.player.stop(true);
        });
        object.player.on('stateChange', (o, n) => {
            if (o.status === AudioPlayerStatus.Playing && n.status === AudioPlayerStatus.Idle) {
                if (connection.loop) {
                    console.log(`before: ${o.status}\nafter: ${n.status}\ncurrent: ${connection.player.state.status}`);
                    return setTimeout(() => {
                        connection.player.play(createAudioResource(connection.link.resource));
                        const embed = new MessageEmbed().setColor('GREEN');
                        decorateEmbed(`Now Looping`, embed, connection.link);
                        return message.channel.send({ embeds: [embed] });
                    }, 1000);
                }
                if (connection.queue.length && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    const queue = connection.queue.shift();
                    connection.player.play(createAudioResource(queue.resource));
                    if (connection.repeat) connection.queue.push(queue);
                    connection.link = queue;
                    const embed = new MessageEmbed().setColor('GREEN');
                    decorateEmbed(`Now Playing`, embed, queue);
                    return message.channel.send({ embeds: [embed] });
                }
                setTimeout(() => {
                    if (connection.player.state.status === AudioPlayerStatus.Idle && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.player.stop(true);
                        connection.player = undefined;
                        connection.worker.terminate();
                        connection.destroy();
                        clearInterval(guild.me.voice.timer);
                        guild.me.voice.timer = null;
                    }
                }, 10000);
            }
        });
        object.player.play(createAudioResource(object.resource));
    }
    else if (object.type === 'pause') 
        object.player.pause();
    else if (object.type === 'unpause')
        object.player.unpause();
    else if (object.type === 'stop')
        object.player.stop();
});