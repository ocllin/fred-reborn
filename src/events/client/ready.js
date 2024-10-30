const { scheduleScrape } = require('../../functions/handlers/scheduler')
const { postRandomEvent } = require('../../utils/eventManager')
const setupExpressAPI = require('../../../api-server')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Fred reborn is ready to dab')
        setupExpressAPI(client) // Pass the client to the Express server
    },
}
