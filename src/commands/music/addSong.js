const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs');
const util = require('util')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsong')
        .setDescription('Add song to /songs command')
        .addStringOption(option => option.setName('song_name').setDescription('Enter the song name'))
        .addStringOption(option => option.setName('song_url').setDescription('Enter a song url')),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return
        if (interaction.user.id !== '89973782285910016') return interaction.reply(`You don't have permission to do this`)

        const songName = interaction.options.getString('song_name')
        const songUrl = interaction.options.getString('song_url')
        if (!songName || !songUrl) return interaction.reply('Fill out both fields fam!')

        let jsonData = require('../../../config.json')
        if (jsonData.songs.filter(e => (e.label === songName || e.value === songUrl)).length > 0) return interaction.reply('This song already exists')

        jsonData.songs.push({
            label: songName,
            value: songUrl
        })

        fs.writeFile('config.json', JSON.stringify(jsonData, null, 4), (err) => {
            if (err) console.log(err)
            interaction.reply("Added the song to the list!")
        })
    }
}