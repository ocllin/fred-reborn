const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('songs')
        .setDescription('the jams'),
    async execute(interaction, client) {
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                .setCustomId('song_selection')
                .setPlaceholder('Nothing selected')
                .addOptions(client.songs),
            )
        interaction.reply({ components: [row] })
    }
}