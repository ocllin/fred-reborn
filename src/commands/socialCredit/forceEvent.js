const { SlashCommandBuilder } = require('@discordjs/builders')
const { postRandomEvent } = require('../../utils/eventManager')

const ALLOWED_USER_ID = '89973782285910016'

module.exports = {
    data: new SlashCommandBuilder().setName('forceevent').setDescription('Force a social credit event (admin only)'),
    async execute(interaction) {
        if (interaction.user.id !== ALLOWED_USER_ID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true })
        }

        const channelId = interaction.channel.id
        await postRandomEvent(interaction.client, channelId)
        await interaction.reply('A social credit event has been forced!')
    },
}
