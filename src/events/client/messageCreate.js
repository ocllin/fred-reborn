const got = require('got')
const { createWriteStream } = require('fs')
const fs = require('fs')
const tiktokChannels = ['765560518155960351', '900750065977655316']
const { updateWordCount } = require('../../functions/handlers/wordCountHelpers')
const { downloadVideo } = require('../../functions/handlers/videoDownloader')

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.content) return // Ignore bot messages and empty messages

        if (tiktokChannels.includes(message.channel.id)) {
            const urlRegex = /\bhttps?:\/\/\S+/gi
            const urls = message.content.match(urlRegex)

            if (!urls) return

            const recognizedPlatforms = ['tiktok.com']

            const isRecognizedPlatform = urls.some((url) => recognizedPlatforms.some((platform) => url.includes(platform)))

            if (isRecognizedPlatform) {
                try {
                    const videoPath = await downloadVideo(urls[0])
                    await message.channel.send({
                        files: [
                            {
                                attachment: videoPath,
                                name: 'video.mp4',
                            },
                        ],
                    })

                    // Remove the downloaded file after sending
                    fs.unlinkSync(videoPath)
                } catch (error) {
                    console.error(error)
                }
            }
        }

        const isCustomEmojiOnly = message.content.match(/<(a)?:\w+:\d+>/g) // Pattern for Discord custom emojis
        if (isCustomEmojiOnly && Math.random() < 0.01) {
            await message.reply('nice')
        }
    },
}
