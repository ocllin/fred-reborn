const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the full resolution avatar of a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to get the avatar of').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })

        const embed = new EmbedBuilder().setTitle(`${user.username}'s Avatar`).setImage(avatarURL).setColor(0x00ae86)

        await interaction.reply({ embeds: [embed] })
    },
}
