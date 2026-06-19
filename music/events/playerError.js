const { QueueRepeatMode } = require('discord-player');
const { sendGuildLog } = require('../../utils/serverLogger');

module.exports = {
    name: 'playerError',
    isPlayer: true,
    async execute(queue, error, client, player, config) {
        console.error('Stream error:', error.message);
        queue.metadata.channel.send(`⚠️ Stream error (skipping): ${error.message}`).catch(console.error);
        
        // Log to the private log channel
        await sendGuildLog(queue.metadata.guild, `❌ **Player Error:** ${error.message}`);

        try {
            if (!queue.tracks.toArray().length && queue.repeatMode !== QueueRepeatMode.AUTOPLAY) {
                queue.delete();
            } else {
                queue.node.skip();
            }
        } catch (e) {
            console.error('Error while handling playerError skip:', e.message);
            await sendGuildLog(queue.metadata.guild, `⚠️ **Critical Error** during skip handling: ${e.message}`);
        }
    }
};
