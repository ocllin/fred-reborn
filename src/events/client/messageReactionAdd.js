const { addCredit } = require('../../utils/socialCreditManager')
module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user, client) {
        if (user.bot) return
        if (!reaction.message.guild) return

        const tiktokChannel = '765560518155960351'

        if (reaction.message.channel.id !== tiktokChannel) {
            return
        }

        // Fetch the message if it's not cached
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch()
            } catch (error) {
                console.error('Error fetching the message:', error)
                return
            }
        }

        const messageAuthor = reaction.message.author

        if (messageAuthor && messageAuthor.id) {
            const messageAuthorId = messageAuthor.id
            addCredit(messageAuthorId, 10, 'Received a reaction.')
            return
        } else {
            console.error('Failed to get the message author ID. Author is null or undefined.')
            return
        }

        const roles = {
            among_us: '756279621410095178', // Among us
            csgo: '1092958924229050439', // CS GO
            dota2: '967949280943935498', // Dota 2
            fortnite: '936423766433611827', // Fortnite
            maplestory: '826797991003684864', // Maplestory
            poe: '688042098154405959', // POE
            phasmophobia: '967217771333173268', // Phasmophobia
            wow: '715381009322868746', // WoW
            // add more emoji-role pairs as needed
        }

        if (reaction.partial) {
            try {
                await reaction.fetch()
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error)
                return
            }
        }

        // Check if the reaction is on the correct message and has a corresponding role
        if (reaction.message.id === message.id && roles[reaction.emoji.name]) {
            console.log('in conditional')
            const role = reaction.message.guild.roles.cache.get(roles[reaction.emoji.name])
            if (!role) {
                console.error('Role not found: ', roles[reaction.emoji.name])
                return
            }

            const member = reaction.message.guild.members.cache.get(user.id)
            if (!member) {
                console.error('Member not found: ', user.id)
                return
            }

            // Add the role to the user
            member.roles
                .add(role)
                .then(() => console.log(`Added role ${role.name} to ${member.user.username}`))
                .catch((error) => console.error('Error adding role: ', error))
        }
    },
}
