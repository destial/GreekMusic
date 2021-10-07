const { Guild, Message, MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, 
    AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const getVideoLink = require('../utils/getVideoLink');
const decorateEmbed = require('../utils/decorateEmbed');
const createAudio = require('../utils/createAudio');

module.exports = {
    aliases: ['p'],
    description: 'Play a song',
    usage: '[ query ]',
    /**
     * 
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {string[]} args 
     */
    async run(guild, message, args) {
        const { member } = message;
        if (!member.voice.channelId) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('You are not in a voice channel!');
            embed.setDescription('Join a voice channel so that I may follow you!');
            return message.channel.send({ embeds: [embed] });
        }
        const { voice } = member;
        if (voice.channel.type === "GUILD_STAGE_VOICE") {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('I am not allowed to join a Stage Channel!');
            embed.setDescription('Please join a regular Voice Channel!');
            return message.channel.send({ embeds: [embed] });
        }
        if (!args.length) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('Please enter a search query!');
            embed.setDescription('You can enter the following:\n- A youtube search term\n- A youtube video link\n- A spotify link\n- A soundcloud track link');
            return message.channel.send({ embeds: [embed] });
        }
        var connection = getVoiceConnection(guild.id);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voice.channelId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            if (!connection) {
                const embed = new MessageEmbed().setColor('RED');
                embed.setAuthor('I do not have permissions to join that voice channel!');
                return message.channel.send({ embeds: [embed] });
            }
            connection.player = createAudioPlayer();
            guild.me.voice.timer = setInterval(() => {
                if (guild.me.voice.channel && guild.me.voice.channel.members.size === 1) {
                    if (connection.player) connection.player.stop();
                    connection.player = undefined;
                    connection.destroy();
                    clearInterval(guild.me.voice.timer);
                    guild.me.voice.timer = null;
                }
            }, 5000);
            connection.player.on('error', (err) => {
                console.log(err.message);
                const embed = new MessageEmbed().setColor('RED');
                embed.setTitle('An error has occured while playing');
                embed.setDescription('Probably internet bad.');
                message.channel.send({ embeds: [embed] });
                // connection.player.stop(true);
            });
            connection.player.on('stateChange', (o, n) => {
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
                            connection.destroy();
                            clearInterval(guild.me.voice.timer);
                            guild.me.voice.timer = null;
                        }
                    }, 10000);
                }
            });
            connection.subscribe(connection.player);
            connection.queue = [];
            connection.loop = false;
            connection.repeat = false;
        }
        if (connection.joinConfig.channelId !== voice.channelId) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setAuthor('Someone is already using the bot!');
            embed.setDescription('Please join the same voice channel as this bot!');
            return message.channel.send({ embeds: [embed] });
        }
        const loadingEmbed = new MessageEmbed().setColor('ORANGE').setAuthor('Loading...');
        const loadingReply = await message.channel.send({ embeds: [loadingEmbed] });
        const link = await getVideoLink(args.join(' '));
        loadingReply.delete().catch(err => {});
        if (!link) {
            const embed = new MessageEmbed().setColor('RED');
            embed.setTitle(`No results found!`);
            return message.channel.send({ embeds: [embed] });
        }
        const embed = new MessageEmbed().setColor('GREEN');
        if (link.list.length) {
            const r = link.list.shift();
            link.resource = r.resource;
            link.author = r.author;
            link.title = r.title;
            link.url = r.url;
            link.thumbnail = r.thumbnail;
            decorateEmbed(`Now Playing`, embed, link);
            var i = 0;
            for (const track of link.list) {
                connection.queue.push(track);
                embed.addField('Queued', `${++i}. [${track.title}](${track.url})`, false);
            }
        } else {
            decorateEmbed(`Now Playing`, embed, link);
        }
        connection.player.play(createAudioResource(link.resource));
        connection.link = link;
        connection.channel = voice.channelId;
        try {
            guild.me.voice.setDeaf(true);
        } catch(err) {}
        return message.channel.send({ embeds: [embed] });
    }
}