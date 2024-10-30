const { handleEventCheck } = require('../../utils/scheduledEventHandler')

module.exports = {
    name: 'guildScheduledEventUpdate',
    async execute(oldGuildScheduledEvent, newGuildScheduledEvent, client) {
        if (newGuildScheduledEvent.status === 2) {
            await handleEventCheck(newGuildScheduledEvent, client)
        }
    },
}
