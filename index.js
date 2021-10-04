require('dotenv').config();
const sqlite = require('sqlite3');
const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES
]
});

client.db = new sqlite.Database('data.db', (err) => {
    if (err) throw err;
    console.log('Connected to database!');
    client.db.run(`CREATE TABLE IF NOT EXISTS guilds (id VARCHAR(32) PRIMARY KEY, prefix VARCHAR(32))`);
});

client.commands = new Collection();
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of files) {
    const command = require(`./commands/${file}`);
    client.commands.set(file.toLowerCase().substring(0, file.length - 3), command);
    console.log(`Registered command ${file}`);
    if (command.aliases) {
        for (const alias of command.aliases) {
            client.commands.set(alias.toLowerCase(), command);
        }
    }
}

const listeners = fs.readdirSync('./listeners').filter(file => file.endsWith('.js'));
for (const listener of listeners) {
    const listen = require(`./listeners/${listener}`);
    listen.run(client);
    console.log(`Registered listener ${listener}`);
}

process.on('uncaughtException', (err) => {
    console.log(err);
});

process.on('unhandledRejection', (err) => {
    console.log(err);
});

process.on('exit', (e) => {
   client.db.close(); 
});

client.login(process.env.TOKEN);