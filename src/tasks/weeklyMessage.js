const cron = require('node-cron')

module.exports = (client) => {
    cron.schedule('0 9 * * 3', () => {
        const channel = client.channels.cache.get('932669311389159505')
        if (!channel) {
            console.error('Channel not found!')
            return
        }
        channel.send('reminder: chris is in the office today 👍')
    })
}
