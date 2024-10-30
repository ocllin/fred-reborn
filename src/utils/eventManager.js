const { AttachmentBuilder } = require('discord.js') // Updated import
const fs = require('fs')
const path = require('path')
const { addCredit } = require('./socialCreditManager')

const rarityFolders = {
    common: 'common',
    rare: 'rare',
    epic: 'epic',
    legendary: 'legendary',
    bad: 'bad',
}

const rarityWeights = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    bad: 100,
}

const socialCreditMappingPath = path.resolve(__dirname, '../../assets/socialcredit/socialCreditMapping.json')
const socialCreditMapping = JSON.parse(fs.readFileSync(socialCreditMappingPath, 'utf-8'))

let activeEvents = new Map()

function generateCode(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        code += characters[randomIndex]
    }
    return code
}

function getRandomRarity() {
    const totalWeight = Object.values(rarityWeights).reduce((acc, weight) => acc + weight, 0)
    const random = Math.floor(Math.random() * totalWeight)
    let runningWeight = 0

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
        runningWeight += weight
        if (random < runningWeight) {
            return rarity
        }
    }

    return 'common'
}

function getRandomImage(rarity) {
    const folderPath = path.resolve(__dirname, `../../assets/socialcredit/${rarity}`)
    const files = fs.readdirSync(folderPath)
    const randomFile = files[Math.floor(Math.random() * files.length)]
    const creditAmount = socialCreditMapping[rarity][randomFile]
    return { filename: randomFile, creditAmount }
}

async function postRandomEvent(client, channelId) {
    const channel = client.channels.cache.get(channelId)
    if (!channel) return

    const rarity = getRandomRarity()
    const { filename, creditAmount } = getRandomImage(rarity)
    const code = generateCode()

    const event = { code, creditAmount }
    activeEvents.set(code, event)

    const message = await channel.send({
        content: `Redeem using \`/redeem ${code}\``,
        files: [new AttachmentBuilder(path.resolve(__dirname, `../../assets/socialcredit/${rarity}/${filename}`))],
    })

    setTimeout(() => {
        message.delete()
        activeEvents.delete(code)
    }, 5 * 60 * 1000) // 5 minutes
}

function redeemCode(userId, code, targetUserId = null) {
    const event = activeEvents.get(code)
    if (event) {
        const actualUserId = event.creditAmount < 0 && targetUserId && Math.random() < 0.5 ? targetUserId : userId // 50/50 chance for bad credit
        addCredit(actualUserId, event.creditAmount, `Redeemed code ${code}`)
        activeEvents.delete(code)
        return { creditAmount: event.creditAmount, actualUserId }
    }
    return null
}

module.exports = { postRandomEvent, redeemCode, generateCode }
