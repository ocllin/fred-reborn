const fs = require('fs').promises
const path = require('path')

// JSON file to store and read word counts, adjust the path as needed
const WORD_COUNTS_FILE = path.join(__dirname, '..', '..', '..', 'wordCounts.json')

async function updateWordCount(guildId, userId, wordCount, isBot) {
    if (isBot) return
    let allWordCounts = {}

    // Read the current word counts from the file
    try {
        const data = await fs.readFile(WORD_COUNTS_FILE, 'utf8')
        allWordCounts = JSON.parse(data)
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to read word counts file:', error)
            throw error // Rethrow the error if it's not because the file doesn't exist
        }
        // If the file doesn't exist, initialize it with an empty object for the guild
        allWordCounts[guildId] = {}
    }

    // Initialize the guild object if it doesn't exist
    if (!allWordCounts[guildId]) {
        allWordCounts[guildId] = {}
    }

    // Update the word count for the user within the guild
    allWordCounts[guildId][userId] = (allWordCounts[guildId][userId] || 0) + wordCount

    // Write the updated word counts back to the file
    await fs.writeFile(WORD_COUNTS_FILE, JSON.stringify(allWordCounts), 'utf8')
}

module.exports = {
    updateWordCount,
}
