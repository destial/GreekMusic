const { MessageEmbed } = require('discord.js');

const postProcessCommand = (message, args) => {
    const cmd = args.shift().toLowerCase();
    if (!message.client.commands.get(cmd)) return false;
    message.client.commands.get(cmd).run(message.guild, message, args, cmd);
    return true;
};

const heyGreek = async (message) => {
    if (!message.content.toLowerCase().startsWith('hey greek')) return false;
    const embed = new MessageEmbed().setColor('BLUE');
    embed.setAuthor(`I'm listening...`);
    const filter = (m) => m.author.id === message.author.id;
    const listening = await message.channel.send({ embeds: [embed] });
    const messages = await message.channel.awaitMessages({ filter, time: 10000, max: 1 });
    if (!messages.size) {
        embed.setAuthor(`You didn't say anything!`);
        message.channel.send({ embeds: [embed] });
        listening.delete();
        return true;
    }
    const args = messages.first().content.split(' ');
    if (!postProcessCommand(message, args)) {
        embed.setColor('RED');
        embed.setAuthor(`Sorry, I didn't understand that!`);
        embed.setDescription(`You can look at my commands via ${"`"}${message.guild.prefix}help${"`"}`)
        message.channel.send({ embeds: [embed] });
    }
    listening.delete();
    return true;
};

const processCommand = async (message) => {
    if (await heyGreek(message)) return;
    if (!message.content.startsWith(message.guild.prefix)) return;
    const args = message.content.slice(message.guild.prefix.length).split(' ');
    postProcessCommand(message, args);
}

module.exports = {
    heyGreek,
    postProcessCommand,
    processCommand,
}