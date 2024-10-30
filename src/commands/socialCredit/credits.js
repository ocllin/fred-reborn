const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { getCredit } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Check your social credit balance')
        .addUserOption((option) => option.setName('user').setDescription('The user to check the social credit of').setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user
        const credit = getCredit(user.id)

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('Social Credit Balance')
            .setDescription(`${user.username} has ${credit} social credit points.`)
            .setTimestamp()

        await interaction.reply({ embeds: [embed] })
    },
}
