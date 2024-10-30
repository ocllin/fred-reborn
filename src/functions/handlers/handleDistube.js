const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const { DisTube } = require('distube')
const { DiscordAPIError, EmbedBuilder, TextChannel } = require('discord.js')

module.exports = (client) => {
    client.handleDistube = async () => {
        const distubeConfig = {
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            plugins: [new YtDlpPlugin()],
        }

        client.distube = new DisTube(client, distubeConfig)
        setupEventHandlers(client)
    }
}

function setupEventHandlers(client) {
    const songEmbed = createSongEmbed()

    client.distube
        .on('playSong', (queue, song) => handlePlaySong(queue, song, songEmbed))
        .on('addSong', (queue, song) => handleAddSong(client, queue, song))
        .on('volume', (queue, volume) => handleVolumeChange(queue, volume))
        .on('error', (channel, error) => handleError(client, channel, error))
        .on('empty', (channel) => handleEmpty(channel))
        .on('searchNoResult', (message, query) => handleSearchNoResult(message, query))
        .on('finish', (queue) => handleFinish(queue))
}

function createSongEmbed() {
    return new EmbedBuilder().setColor(0x0099ff).setAuthor({ name: 'Now Playing', iconURL: 'https://i.imgur.com/aBjgfxt.png' })
}

function handlePlaySong(queue, song, embed) {
    const youtubeId = song.url.replace('https://www.youtube.com/watch?v=', '')
    const videoThumbnail = `http://img.youtube.com/vi/${youtubeId}/0.jpg`
    embed.setTitle(song.name).setURL(song.url).setThumbnail(videoThumbnail).setTimestamp().setDescription(`Length: ${song.formattedDuration}`)
    if (queue.textChannel) {
        queue.textChannel.send({ embeds: [embed] })
    } else {
        console.warn('No text channel available for sending messages.')
    }
}

function handleAddSong(client, queue, song) {
    queue.textChannel.send(`${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`)
}

function handleVolumeChange(queue, volume) {
    queue.textChannel.send(`Volume changed to ${volume}%`)
}

function handleError(client, channel, error) {
    if (channel instanceof TextChannel) {
        console.warn(error)
        channel.send(`${client.emotes.error} | i no no wanna :(`)
    } else {
        console.error(error)
    }
}

function handleEmpty(channel) {
    if (channel) {
        console.log('leaving VC')
    }
}

function handleSearchNoResult(message, query) {
    message.channel.send(`${client.emotes.error} | No result found for \`${query}\`!`)
}

function handleFinish(queue) {
    console.log('done the queue')
}
