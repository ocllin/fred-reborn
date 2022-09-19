const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removesong')
        .setDescription('Removes song to /songs command')
        .addStringOption(option => option.setName('song_name').setDescription('Enter the song name')),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return
        if (interaction.user.id !== '89973782285910016') return interaction.reply(`You don't have permission to do this`)

        const songName = interaction.options.getString('song_name')

        let jsonData = require('../../../config.json')
        const index = jsonData.songs.findIndex(e => {
            return e.label === songName
        })

        if (!index) return interaction.reply('I couldnt find a song with this name in the list')
        jsonData.songs.splice(index, 1)

        fs.writeFile('config.json', JSON.stringify(jsonData, null, 4), (err) => {
            if (err) console.log(err)
            interaction.reply("Removed the song to the list!")
        })
    }
}