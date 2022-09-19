const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync('./src/commands')
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith('.js'))

            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`)
                client.commands.set(command.data.name, command)
                client.commandArray.push(command.data.toJSON())
                console.log(`Command: ${command.data.name} pushed`)
            }
        }

        const clientId = '1014355840309936158';
        const rest = new REST({ version: '9' }).setToken(process.env.token)

        try {
            console.log('Started refreshing application (/) commands.')
            await rest.put(Routes.applicationCommands(clientId), { body: client.commandArray })
            console.log('Successfully reloaded application (/) commands.')
        } catch (error) {
            console.error(error)
        }
    }
}