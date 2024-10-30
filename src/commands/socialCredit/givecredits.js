const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { getCredit, addCredit } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givecredits')
        .setDescription('Give social credit to another user')
        .addUserOption((option) => option.setName('user').setDescription('The user to give social credit to').setRequired(true))
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount of social credit to give').setRequired(true)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user')
        const amount = interaction.options.getInteger('amount')
        const userId = interaction.user.id
        const targetUserId = targetUser.id

        if (amount <= 0) {
            await interaction.reply({ content: 'You cannot give negative or zero social credits.', ephemeral: true })
            return
        }

        const userCredits = getCredit(userId)
        if (userCredits < 0) {
            await interaction.reply({ content: 'You cannot give social credits with a negative balance.', ephemeral: true })
            return
        }

        if (userCredits < amount) {
            await interaction.reply({ content: 'You do not have enough social credits to give.', ephemeral: true })
            return
        }

        addCredit(userId, -amount, `Gave ${amount} social credits to ${targetUser.username}`)
        addCredit(targetUserId, amount, `Received ${amount} social credits from ${interaction.user.username}`)

        const embed = new EmbedBuilder()
            .setTitle('Social Credit Transfer')
            .setDescription(`You gave ${amount} social credits to ${targetUser.username}.`)
            .addFields(
                { name: 'Your Social Credits', value: `${getCredit(userId)}`, inline: true },
                { name: `${targetUser.username}'s Social Credits`, value: `${getCredit(targetUserId)}`, inline: true }
            )
            .setColor('#FFD700')

        await interaction.reply({ embeds: [embed] })
    },
}
