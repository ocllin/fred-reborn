const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('stop the beats'),

    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guild)
        if (!queue) return interaction.reply('bruh')

        client.distube.stop(queue)
        const playEmoji = client.emojis.cache.find((emoji) => emoji.name === 'fred_stop')
        return interaction.reply(`${playEmoji} | Stopping the show my man`)
    },
}
