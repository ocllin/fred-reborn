// src/events/client/userUpdate.js
module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser, client) {
        console.log(oldUser)
        // Replace 'userID' with the actual user ID
        const trackedUserId = '159985870458322944'
        // Replace 'channelID' with the actual channel ID
        const channelId = '750728624038084721'

        // If this update doesn't concern the user we're tracking, ignore it
        if (oldUser.id !== trackedUserId) return

        // Check if the discriminator has changed
        if (oldUser.discriminator !== newUser.discriminator) {
            // Fetch the channel
            const channel = await client.channels.fetch(channelId)

            // Send the message
            await channel.send(`@here, ${oldUser.username}'s discriminator changed from ${oldUser.discriminator} to ${newUser.discriminator}`)
        }
    },
}
