const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { getAllCredits } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('Shows the top 10 users with the highest social credit'),

    async execute(interaction) {
        const guild = interaction.guild
        const credits = getAllCredits()
        const sortedCredits = Object.entries(credits)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)

        const embed = new EmbedBuilder()
            .setTitle('Social Credit Leaderboard')
            .setDescription('Top 10 users with the highest social credit')
            .setColor('#FFD700')
            .setThumbnail('https://i.imgur.com/Qm0OCdq.png')

        for (const [userId, credit] of sortedCredits) {
            const member = await guild.members.fetch(userId).catch(() => null)
            const displayName = member ? member.nickname || member.user.username : 'Unknown User'
            embed.addFields({ name: displayName, value: `${credit} social credit`, inline: true })
        }

        await interaction.reply({ embeds: [embed] })
    },
}
