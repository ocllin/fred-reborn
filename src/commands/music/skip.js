const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('onto the next track'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guild)
        if (!queue) return interaction.reply(`${client.emotes.error} | There is nothing in the queue right now!`)

        try {
            await queue.skip()
            interaction.reply(`${client.emotes.success} | Skipped that shit!`)
        } catch (e) {
            interaction.reply(`${client.emotes.error} | ${e}`)
        }
    },
}
