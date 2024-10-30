const { SlashCommandBuilder, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play your favorite tunes!')
        .addStringOption((option) => option.setName('song_name').setDescription('Enter a song name or URL').setRequired(true))
        .addChannelOption((option) => option.setName('channel').setDescription('Optional: Select a voice channel').setRequired(false)),

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return

        const songString = interaction.options.getString('song_name')
        const channelOption = interaction.options.getChannel('channel')
        let voiceChannel = channelOption && channelOption.type === ChannelType.GuildVoice ? channelOption : interaction.member.voice.channel

        if (!voiceChannel) {
            return interaction.reply('Please join a voice channel or specify a valid voice channel.')
        }

        try {
            // Defer the interaction initially
            await interaction.deferReply()

            await client.distube.play(voiceChannel, songString, {
                member: interaction.member,
                textChannel: interaction.channel,
            })

            const playEmoji = client.emojis.cache.find((emoji) => emoji.name === 'fred_start')

            // After processing is complete, edit the initial reply
            await interaction.editReply(`${playEmoji} | Added your song to the queue big dog!!`)
        } catch (error) {
            console.error(error)
            // Edit the reply with an error message
            await interaction.editReply('There was an error trying to play that song.')
        }
    },
}
