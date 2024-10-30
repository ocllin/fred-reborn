const express = require('express')
const bodyParser = require('body-parser')

module.exports = function (client) {
    const DISCORD_SERVER_ID = '493462454316171290'
    const app = express()
    app.use(bodyParser.json())

    // Endpoint to handle song requests from the Next.js app
    app.post('/play-song', async (req, res) => {
        const { youtubeUrl, channelId } = req.body

        try {
            const guild = client.guilds.cache.get(DISCORD_SERVER_ID) // The guild where the bot is active
            let voiceChannel

            if (channelId) {
                // Use the provided channelId to find the voice channel
                voiceChannel = guild.channels.cache.get(channelId)
            } else {
                // Fallback to a default voice channel (e.g., a preconfigured one)
                voiceChannel = guild.channels.cache.find(
                    (channel) => channel.type === 'GUILD_VOICE' // or 'voice' for older versions of discord.js
                )
            }

            if (!voiceChannel) {
                return res.status(400).json({ message: 'Voice channel not found' })
            }

            // Play the song using DisTube, and use the bot itself as the member
            await client.distube.play(voiceChannel, youtubeUrl, {
                textChannel: voiceChannel, // Use voiceChannel here for simplicity
                member: guild.members.me, // This is the bot itself
            })

            return res.status(200).json({ message: 'Song request sent!' })
        } catch (error) {
            console.error('Error playing song:', error)
            return res.status(500).json({ message: 'Error executing play command' })
        }
    })

    app.get('/queue', async (req, res) => {
        try {
            const guildId = req.query.guildId // Get guildId from the request
            const queue = client.distube.getQueue(guildId)

            if (!queue || !queue.songs.length) {
                return res.status(200).json({ message: 'Queue is empty', songs: [] })
            }

            const queueData = queue.songs.map((song, index) => ({
                position: index + 1,
                name: song.name,
                url: song.url,
                duration: song.formattedDuration,
                thumbnail: song.thumbnail,
            }))

            res.status(200).json({
                message: 'Success',
                songs: queueData,
                totalDuration: queue.formattedDuration,
                songCount: queue.songs.length,
            })
        } catch (error) {
            console.error('Error fetching queue:', error)
            res.status(500).json({ message: 'Error fetching queue' })
        }
    })

    // In your bot server (e.g., Express API setup)
    app.get('/current-song', (req, res) => {
        try {
            const queue = client.distube.getQueue(DISCORD_SERVER_ID)

            if (!queue || !queue.songs.length) {
                return res.json({})
            }

            const currentSong = queue.songs[0] // Get the currently playing song
            const progress = queue.currentTime // Get current timestamp in seconds

            if (currentSong) {
                res.json({
                    name: currentSong.name,
                    url: currentSong.url,
                    duration: currentSong.duration,
                    currentTime: progress,
                    thumbnail: currentSong.thumbnail,
                })
            } else {
                res.status(404).json({})
            }
        } catch (error) {
            console.error('Error fetching current song:', error)
            res.status(500).json({ message: 'Error fetching current song info.' })
        }
    })

    app.post('/remove-song', async (req, res) => {
        try {
            const { guildId, position } = req.body

            // Get the queue for the specified guild
            const queue = client.distube.getQueue(guildId)

            if (!queue) {
                return res.status(404).json({ message: 'No active queue found' })
            }

            // Check if the position is within the bounds of the queue
            if (position < 1 || position > queue.songs.length) {
                return res.status(400).json({ message: 'Invalid song position' })
            }

            // Remove the song (position - 1 to adjust for zero-based index)
            const removedSong = queue.songs.splice(position - 1, 1)[0]
            res.status(200).json({ message: `Removed ${removedSong.name} from the queue` })
        } catch (error) {
            console.error('Error removing song:', error)
            res.status(500).json({ message: 'Error removing song from queue' })
        }
    })

    app.post('/skip-song', async (req, res) => {
        try {
            const { guildId } = req.body

            // Get the queue for the specified guild
            const queue = client.distube.getQueue(guildId)

            if (!queue) {
                return res.status(404).json({ message: 'No active queue found' })
            }

            // Skip the current song
            await queue.skip()
            res.status(200).json({ message: 'Skipped the current song' })
        } catch (error) {
            console.error('Error skipping song:', error)
            res.status(500).json({ message: 'Error skipping song' })
        }
    })

    app.post('/reorder-queue', async (req, res) => {
        const { guildId, currentPos, newPos } = req.body

        try {
            const queue = client.distube.getQueue(guildId)
            if (!queue) {
                return res.status(400).json({ message: 'No active queue found.' })
            }

            const fromIndex = currentPos - 1
            const toIndex = newPos - 1

            // Check that indices are within bounds
            if (fromIndex < 0 || fromIndex >= queue.songs.length || toIndex < 0 || toIndex >= queue.songs.length) {
                return res.status(400).json({ message: 'Invalid song position.' })
            }

            // Move the song within the queue
            const [movedSong] = queue.songs.splice(fromIndex, 1)
            if (movedSong) {
                queue.songs.splice(toIndex, 0, movedSong)
            }

            // Filter out any undefined entries (if any were accidentally added)
            queue.songs = queue.songs.filter(Boolean)

            res.status(200).json({ message: 'Song reordered successfully!' })
        } catch (error) {
            console.error('Error reordering song:', error)
            res.status(500).json({ message: 'Error reordering song.' })
        }
    })

    app.get('/health', (req, res) => {
        try {
            res.status(200).json({ status: 'online' })
        } catch (error) {
            res.status(500).json({ status: 'offline', error: error.message })
        }
    })

    // Start the Express server
    const PORT = 3001 // You can change this port if needed
    app.listen(PORT, () => {
        console.log(`Bot API server is running on port ${PORT}`)
    })
}
