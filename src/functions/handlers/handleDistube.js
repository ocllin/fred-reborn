const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const { DisTube } = require('distube')
const { EmbedBuilder } = require('discord.js')

module.exports = (client) => {
    client.handleDistube = async() => {
        client.distube = new DisTube(client, {
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            leaveOnEmpty: true,
            leaveOnFinish: false,
            leaveOnStop: true,
            plugins: [
                new SpotifyPlugin({
                    emitEventsAfterFetching: true
                }),
                new SoundCloudPlugin(),
                new YtDlpPlugin()
            ]
        })

        const songEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: 'Now Playing', iconURL: 'https://i.imgur.com/aBjgfxt.png' })

        client.distube
            .on('playSong', (queue, song) => {

                const youtubeId = song.url.replace('https://www.youtube.com/watch?v=', '')
                const videoThumbnail = `http://img.youtube.com/vi/${youtubeId}/0.jpg`

                // Build up extra components of embed
                songEmbed.setTitle(song.name)
                songEmbed.setURL(song.url)
                songEmbed.setThumbnail(videoThumbnail)
                songEmbed.setTimestamp()
                songEmbed.setDescription(`Length: ${song.formattedDuration}`)
                queue.textChannel.send({ embeds: [songEmbed] });
            })
            .on('addSong', (queue, song) =>
                queue.textChannel.send(
                    `${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
                )
            )
            .on('addList', (queue, playlist) =>
                queue.textChannel.send(
                    `${client.emotes.success} | Added \`${playlist.name}\` playlist (${
                playlist.songs.length
              } songs) to queue`
                )
            )
            .on('error', (channel, e) => {
                if (channel) channel.send(`${client.emotes.error} | An error encountered: ${e.toString().slice(0, 1974)}`)
                else console.error(e)
            })
            .on('empty', channel => channel.send('Voice channel is empty! Leaving the channel...'))
            .on('searchNoResult', (message, query) =>
                message.channel.send(`${client.emotes.error} | No result found for \`${query}\`!`)
            )
            .on('finish', queue => queue.textChannel.send('Finished!'))
    }
}