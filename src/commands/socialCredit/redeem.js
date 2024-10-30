const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { redeemCode } = require('../../utils/eventManager')
const { getCredit } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('Redeem social credit using a code')
        .addStringOption((option) => option.setName('code').setDescription('The redeem code').setRequired(true))
        .addUserOption((option) => option.setName('user').setDescription('The user to give bad social credit to (optional)').setRequired(false)),

    async execute(interaction) {
        const code = interaction.options.getString('code')
        const targetUser = interaction.options.getUser('user')
        const userId = interaction.user.id
        const targetUserId = targetUser ? targetUser.id : null

        const result = redeemCode(userId, code, targetUserId)

        if (result !== null) {
            const { creditAmount, actualUserId } = result
            const actualUser = await interaction.client.users.fetch(actualUserId)

            const embed = new EmbedBuilder().setColor('#FFD700').setTimestamp()

            if (creditAmount < 0) {
                if (actualUserId === userId) {
                    if (targetUserId) {
                        embed
                            .setTitle('Attempt Failed')
                            .setDescription(
                                `The gods have shunned you for your attempts. You lose ${-creditAmount} social credit and now have ${getCredit(
                                    actualUserId
                                )} social credit.`
                            )
                    } else {
                        embed
                            .setTitle('Credit Redeemed')
                            .setDescription(
                                `You hold your head high as you claim ${creditAmount} social credit. You now have ${getCredit(
                                    actualUserId
                                )} social credit.`
                            )
                    }
                } else {
                    embed
                        .setTitle('Credit Passed On')
                        .setDescription(
                            `The gods have graced you and passed on bad credit to ${
                                actualUser.username
                            }. They lose ${-creditAmount} social credit and now have ${getCredit(actualUserId)} social credit.`
                        )
                }
            } else {
                embed
                    .setTitle('Credit Redeemed')
                    .setDescription(`You have redeemed ${creditAmount} social credit points! You now have ${getCredit(actualUserId)} points.`)
            }

            await interaction.reply({ embeds: [embed] })
        } else {
            await interaction.reply({ content: 'Invalid code or the code has expired.', ephemeral: true })
        }
    },
}
