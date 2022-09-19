require('dotenv').config()
const { token } = process.env
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const config = require('./../config.json')


const client = new Client({
    intents: [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})
client.commands = new Collection()
client.commandArray = [];

client.config = require('./../config.json')
client.emotes = config.emoji
client.songs = config.songs
const functionFolders = fs.readdirSync('./src/functions')
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'))
    for (const file of functionFiles) {
        require(`./functions/${folder}/${file}`)(client)
    }
}

client.handleEvents()
client.handleCommands()
client.handleDistube()
client.login(token)