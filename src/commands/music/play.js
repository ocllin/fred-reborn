const { SlashCommandBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('dab on the beats')
        .addStringOption(option => option.setName('song_name').setDescription('Enter a song')),
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand() || !interaction.member.voice.channel) return interaction.reply('you gotta be in a channel for that')

        const songString = interaction.options.getString('song_name')
        if (!songString) return interaction.reply({ content: `${client.emotes.error} | Please enter a song url or query to search.` })

        client.distube.play(interaction.member.voice.channel, songString, {
            member: interaction.member,
            textChannel: interaction.channel,
        })

        const playEmoji = client.emojis.cache.find(emoji => emoji.name === 'fred_start')
        return interaction.reply(`${playEmoji} | Added your song to the queue big dog!!`)
    }
}