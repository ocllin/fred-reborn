const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('Displays the current song queue'),

    async execute(interaction, client) {
        // Get the queue for the server
        const queue = client.distube.getQueue(interaction.guildId)

        if (!queue || !queue.songs.length) {
            return interaction.reply('The queue is currently empty!')
        }

        // Format the queue
        const queueEmbed = {
            color: 0x0099ff,
            title: 'Current Queue',
            description: queue.songs.map((song, index) => `${index + 1}. ${song.name} - \`${song.formattedDuration}\``).join('\n'),
            footer: { text: `Total Songs: ${queue.songs.length} | Total Duration: ${queue.formattedDuration}` },
        }

        await interaction.reply({ embeds: [queueEmbed] })
    },
}
