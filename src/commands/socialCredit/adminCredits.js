const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const { getCredit, addCredit } = require('../../utils/socialCreditManager')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admincredits')
        .setDescription('Admin command to give or remove social credit from a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to give or remove social credit from').setRequired(true))
        .addIntegerOption((option) =>
            option.setName('amount').setDescription('The amount of social credit to give or remove (use negative value to remove)').setRequired(true)
        )
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the credit change').setRequired(true)),

    async execute(interaction) {
        // Restrict command to specific user ID
        if (interaction.user.id !== '89973782285910016') {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true })
            return
        }

        const targetUser = interaction.options.getUser('user')
        const amount = interaction.options.getInteger('amount')
        const reason = interaction.options.getString('reason')
        const targetUserId = targetUser.id

        addCredit(targetUserId, amount, `${amount > 0 ? 'Gained' : 'Lost'} ${amount} social credits: ${reason}`)

        const embed = new EmbedBuilder()
            .setTitle('Admin Social Credit Change')
            .setDescription(
                `You have ${amount > 0 ? 'given' : 'removed'} ${amount} social credits ${amount > 0 ? 'to' : 'from'} ${targetUser.username}.`
            )
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: `${targetUser.username}'s New Balance`, value: `${getCredit(targetUserId)} social credits`, inline: true }
            )
            .setColor('#FFD700')

        await interaction.reply({ embeds: [embed] })
    },
}
