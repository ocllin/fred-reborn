const { SlashCommandBuilder, AttachmentBuilder, ChannelType } = require('discord.js')
const { createCanvas, loadImage, registerFont } = require('canvas')
const fs = require('fs').promises
const path = require('path')

const WORD_COUNTS_FILE = path.join(__dirname, '..', '..', '..', 'wordCounts.json')
const backgroundPath = path.join(__dirname, '..', '..', '..', 'wafflers.png')

module.exports = {
    data: new SlashCommandBuilder().setName('wafflers').setDescription('Shows a leaderboard of the top 10 users by word count.'),
    async execute(interaction) {
        let wordCounts = {}

        // Check if the JSON file exists
        try {
            const data = await fs.readFile(WORD_COUNTS_FILE, 'utf8')
            wordCounts = JSON.parse(data)
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, so we create it by fetching messages
                console.log('Word counts file does not exist, creating new one...')
                await interaction.deferReply()
                wordCounts = await fetchAllWordCounts(interaction)
                await fs.writeFile(WORD_COUNTS_FILE, JSON.stringify(wordCounts), 'utf8')
            } else {
                // Other errors
                console.error('Failed to read word counts file:', error)
                await interaction.deferReply()
                return interaction.editReply('An error occurred while processing your request.')
            }
        }

        const guildWordCounts = wordCounts[interaction.guild.id] || {}
        // Sort the word counts in descending order and take the top 10
        const sortedWordCounts = Object.entries(guildWordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)

        // Build the leaderboard string
        const leaderboardLines = []
        for (const [userId, count] of sortedWordCounts) {
            try {
                const user = await interaction.guild.members.fetch(userId)
                leaderboardLines.push(`${user.user.username}: (${count})`)
            } catch (error) {
                if (error.code === 10007) {
                    // Member not found in the guild, skip them
                    console.log(`Member with ID ${userId} not found in the guild. Skipping.`)
                    continue // Skip this iteration and move to the next one
                } else {
                    // Other errors
                    console.error(`Failed to fetch user: ${error}`)
                }
            }
        }

        generateLeaderboardImage(leaderboardLines, backgroundPath)
            .then((buffer) => {
                const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' })
                if (interaction.deferred || interaction.replied) {
                    return interaction.editReply({ content: 'Here is the leaderboard:', files: [attachment] })
                } else {
                    return interaction.reply({ content: 'Here is the leaderboard:', files: [attachment] })
                }
            })
            .catch(console.error)
    },
}

async function fetchAllWordCounts(interaction) {
    const wordCounts = {}
    const textChannels = interaction.guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText)
    const totalChannels = textChannels.size
    let currentChannelIndex = 0

    for (const [channelId, channel] of textChannels.entries()) {
        currentChannelIndex++
        console.log(`Processing channel ${currentChannelIndex}/${totalChannels}: ${channel.name} (ID: ${channelId})`)

        let messages
        let lastId
        let totalMessages = 0 // Keep track of the total messages processed in the channel

        while (true) {
            try {
                messages = await channel.messages.fetch({ limit: 100, before: lastId })
                if (messages.size === 0) break

                totalMessages += messages.size
                console.log(`Processing ${messages.size} messages in ${channel.name} (Total processed: ${totalMessages})`)

                messages.forEach((message) => {
                    const wordCount = message.content.split(/\s+/).filter(Boolean).length
                    const authorId = message.author.id
                    wordCounts[authorId] = (wordCounts[authorId] || 0) + wordCount
                })

                lastId = messages.last()?.id
            } catch (error) {
                console.error(`Failed to fetch messages from channel ${channel.name} (ID: ${channelId}): ${error}`)
                break
            }
        }
        console.log(`Finished processing channel ${channel.name}. Total messages processed: ${totalMessages}`)
    }
    const guildWordCounts = { [interaction.guild.id]: wordCounts }
    return guildWordCounts
}

async function generateLeaderboardImage(leaderboardLines, backgroundPath) {
    registerFont('./assets/DejaVuSans.ttf', { family: 'DejaVu Sans' })
    const canvas = createCanvas(1024, 512)
    const ctx = canvas.getContext('2d')

    // Load the background image
    const background = await loadImage(backgroundPath)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    // Define font style
    ctx.font = '30px "DejaVu Sans"'
    ctx.textAlign = 'left'

    // Set fill style to white
    ctx.fillStyle = 'white' // Solid white color
    ctx.strokeStyle = 'black' // Black stroke for contrast
    ctx.lineWidth = 3 // Bolder stroke
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)' // Dark shadow for depth
    ctx.shadowBlur = 5 // Soften the shadow slightly

    // Define padding and spacing
    const padding = 80
    const spacing = 10
    const startY = 80 // Start 40px from the top of the image

    // Calculate the left alignment for both columns
    const leftColumnX = padding
    const rightColumnX = canvas.width / 2 + padding

    // Draw the leaderboard text
    leaderboardLines.forEach((line, index) => {
        // Determine the column based on the index
        const columnX = index < 5 ? leftColumnX : rightColumnX

        // Calculate Y position for each entry
        const rowY = startY + (parseInt(ctx.font, 10) + spacing) * (index % 5)

        // Draw text with 'waffles' instead of 'pts'
        const text = `${index + 1}. ${line.replace(/ pts$/, ' waffles')}`

        // Stroke and fill text for emphasis
        ctx.strokeText(text, columnX, rowY)
        ctx.fillText(text, columnX, rowY)
    })

    // Return the buffer
    return canvas.toBuffer('image/png')
}
