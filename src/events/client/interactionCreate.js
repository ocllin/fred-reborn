module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client
            const { commandName } = interaction
            const command = commands.get(commandName)
            if (!command) return

            try {
                await command.execute(interaction, client)
            } catch (error) {
                console.error(error)
                await interaction.reply({
                    content: 'huh',
                    ephemeral: true,
                })
            }
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'song_selection') {
                if (!interaction.member.voice.channel) return interaction.reply(`You aren't in a voice channel dawg`)
                client.distube.play(interaction.member.voice.channel, interaction.values[0], {
                    member: interaction.member,
                    textChannel: interaction.channel,
                })
                interaction.deferUpdate()
            }
            if (interaction.customId === 'filter_selection') {
                const queue = client.distube.getQueue(interaction.guild)
                if (!queue) return interaction.channel.send(`${client.emotes.error} | There is nothing in the queue right now!`)
                const filter = interaction.values[0]
                console.log(filter)
                if (filter === 'off' && queue.filters.size) queue.filters.clear()
                else if (Object.keys(client.distube.filters).includes(filter)) {
                    if (queue.filters.has(filter)) queue.filters.remove(filter)
                    else queue.filters.add(filter)
                } else return interaction.channel.send(`${client.emotes.error} | Not a valid filter`)
                interaction.channel.send(`Current Queue Filter: \`${queue.filters.names.join(', ') || 'Off'}\``)
                interaction.deferUpdate()
            }
        }
    },
}
