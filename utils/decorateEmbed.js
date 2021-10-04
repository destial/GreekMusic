const { MessageEmbed } = require('discord.js');

/**
 * 
 * @param {string} title 
 * @param {MessageEmbed} embed 
 * @param {object} link 
 * @returns 
 */
const decorateEmbed = (title, embed, link) => {
    embed.setTitle(title);
    embed.addField(link.author, `[${link.title}](${link.url})`);
    embed.setURL(link.url);
    embed.setThumbnail(link.thumbnail);
    return embed;
}

module.exports = decorateEmbed;