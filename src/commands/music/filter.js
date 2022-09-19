const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('filter on the beats'),
    async execute(interaction, client) {
        var filters = []
        var entries = Object.entries(client.distube.filters)
        entries.map((entry) => {
            filters.push({
                label: entry[0],
                value: entry[0]
            })
        });

        filters.push({ label: 'off', value: 'off' })

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                .setCustomId('filter_selection')
                .setPlaceholder('Nothing selected')
                .addOptions(filters),
            )
        interaction.reply({ components: [row] })
    }
}