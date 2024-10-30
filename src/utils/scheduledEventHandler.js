const { getCredit, addCredit } = require('./socialCreditManager')

async function handleEventCheck(event, client) {
    const guild = client.guilds.cache.get(event.guildId)
    const voiceChannel = guild.channels.cache.get(event.channelId)

    if (!voiceChannel) {
        console.error('Voice channel not found')
        return
    }

    const membersInVoice = voiceChannel.members

    // Fetch event subscribers
    const eventAttendees = await event.fetchSubscribers({ cache: true })
    const attendeesSet = new Set(eventAttendees.map((attendee) => attendee.user.id))

    for (const member of guild.members.cache.values()) {
        if (attendeesSet.has(member.id)) {
            if (membersInVoice.has(member.id)) {
                addCredit(member.id, 100, 'Showed up for event on time')
            } else {
                addCredit(member.id, -100, 'Did not show up for event on time')
            }
        }
    }
}

module.exports = { handleEventCheck }
