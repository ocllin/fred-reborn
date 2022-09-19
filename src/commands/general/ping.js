const { SlashCommandBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true
        })

        const newMessage = `Latency: ${client.ws.ping}`
        await interaction.reply(newMessage)
    }
}