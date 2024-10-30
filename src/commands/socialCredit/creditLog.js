const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { getCreditLog } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creditlog')
        .setDescription('Shows your social credit log')
        .addUserOption((option) => option.setName('user').setDescription('The user to check the credit log of (optional)').setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user
        const userId = targetUser.id
        const creditLog = getCreditLog(userId)

        if (creditLog.length === 0) {
            await interaction.reply(`${targetUser.username} has no credit log entries.`)
            return
        }

        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s Social Credit Log`)
            .setDescription('Here are the recent changes to your social credit:')
            .setColor('#FFD700')

        creditLog
            .slice(-10)
            .reverse()
            .forEach((entry) => {
                embed.addFields({
                    name: `${entry.amount > 0 ? 'Gained' : 'Lost'} ${Math.abs(entry.amount)} credits`,
                    value: `${entry.description} - ${new Date(entry.date).toLocaleString()}`,
                    inline: false,
                })
            })

        await interaction.reply({ embeds: [embed] })
    },
}
