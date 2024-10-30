const fs = require('fs')
const path = require('path')

const creditFilePath = path.resolve(__dirname, '../socialCredit.json')
const logFilePath = path.resolve(__dirname, '../creditLog.json')

let socialCreditData = {}
let creditLog = {}

// Load social credit data
if (fs.existsSync(creditFilePath)) {
    const data = fs.readFileSync(creditFilePath, 'utf-8')
    socialCreditData = JSON.parse(data)
} else {
    console.warn(`Credit file not found at ${creditFilePath}. Starting with empty data.`)
}

// Load credit log data
if (fs.existsSync(logFilePath)) {
    const data = fs.readFileSync(logFilePath, 'utf-8')
    creditLog = JSON.parse(data)
} else {
    console.warn(`Log file not found at ${logFilePath}. Starting with empty log.`)
}

function getCredit(userId) {
    return socialCreditData[userId] || 0
}

function addCredit(userId, amount, description) {
    if (!userId) {
        console.error('Invalid userId:', userId)
        return
    }

    if (!socialCreditData[userId]) {
        socialCreditData[userId] = 0
    }

    socialCreditData[userId] += amount
    saveCreditData()

    // Log the credit change
    if (!creditLog[userId]) {
        creditLog[userId] = []
    }

    creditLog[userId].push({
        amount,
        description,
        date: new Date().toISOString(),
    })
    saveCreditLog()
}

function getAllCredits() {
    return socialCreditData
}

function getCreditLog(userId) {
    return creditLog[userId] || []
}

function saveCreditData() {
    fs.writeFileSync(creditFilePath, JSON.stringify(socialCreditData, null, 2), 'utf-8')
}

function saveCreditLog() {
    fs.writeFileSync(logFilePath, JSON.stringify(creditLog, null, 2), 'utf-8')
}

module.exports = { getCredit, addCredit, getAllCredits, getCreditLog }
