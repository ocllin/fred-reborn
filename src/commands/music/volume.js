const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('bump it up')
        .addStringOption((option) => option.setName('volume').setDescription('Enter a volume level').setRequired(true)),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) return interaction.reply('you gotta be in a channel for that')

        const queue = client.distube.getQueue(interaction.guild)
        const volumeString = interaction.options.getString('volume')

        try {
            queue.setVolume(parseInt(volumeString))
            const playEmoji = client.emojis.cache.find((emoji) => emoji.name === 'fred_start')
            return interaction.reply(`${playEmoji} | bumpin the volume!!`)
        } catch (e) {
            console.error(e)
            return interaction.reply(`${client.emotes.error} | Could not change the volume.`)
        }
    },
}
