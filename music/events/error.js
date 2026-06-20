const logger = require('../../utils/logger');
const { sendGuildLog } = require('../../utils/serverLogger');

module.exports = {
    name: 'error',
    isPlayer: true,
    async execute(queue, error, client, player, config) {
        const errorMsg = error?.message || String(error);
        logger.error(`[Player General Error] ${errorMsg}`);

        queue.metadata.channel.send(`⚠️ Player error: ${errorMsg}`).catch(console.error);

        // Log to the private log channel
        await sendGuildLog(queue.metadata.guild, `⚠️ **General Player Error:** ${errorMsg}`);
    }
};
