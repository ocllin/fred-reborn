require('dotenv').config()
const { token } = process.env
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const fs = require('fs')
const path = require('path')
const config = require('./../config.json')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildScheduledEvents,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})
client.commands = new Collection()
client.commandArray = []

client.config = require('./../config.json')
client.emotes = config.emoji
client.songs = config.songs

const functionFolders = fs.readdirSync('./src/functions')
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter((file) => file.endsWith('.js'))
    for (const file of functionFiles) {
        const requiredFile = require(`./functions/${folder}/${file}`)
        if (typeof requiredFile === 'function') {
            requiredFile(client)
        }
    }
}

const tasksPath = path.join(__dirname, 'tasks')
const taskFolders = fs.readdirSync(tasksPath)
for (const file of taskFolders) {
    const task = require(path.join(tasksPath, file))
    if (typeof task === 'function') {
        task(client)
    }
}

client.handleEvents()
client.handleCommands()
client.handleDistube()
client.login(token)
