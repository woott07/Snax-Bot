const { QueueRepeatMode } = require('discord-player');
const { sendGuildLog } = require('../../utils/serverLogger');
const logger = require('../../utils/logger');

module.exports = {
    name: 'playerError',
    isPlayer: true,
    async execute(queue, error, client, player, config) {
        const errorMsg = error?.message || String(error);

        // ── Classify the error ────────────────────────────────────────────────
        let userMessage;
        let severity = 'warn';

        if (errorMsg.includes('Sign in to confirm') || errorMsg.includes('bot')) {
            userMessage = '⚠️ YouTube anti-bot protection triggered on this track. Skipping...';
            severity = 'warn';
        } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
            userMessage = '⚠️ Stream blocked (403 Forbidden). Track may be region-restricted. Skipping...';
            severity = 'warn';
        } else if (errorMsg.includes('410') || errorMsg.includes('Gone')) {
            userMessage = '⚠️ Video unavailable (deleted or private). Skipping...';
            severity = 'warn';
        } else if (errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ECONNRESET') || errorMsg.includes('network')) {
            userMessage = '⚠️ Network error during playback. Skipping...';
            severity = 'error';
        } else {
            userMessage = `⚠️ Stream error (skipping): ${errorMsg}`;
            severity = 'error';
        }

        // Log with appropriate severity
        logger[severity](`[PlayerError] ${errorMsg}`);

        // Notify the user
        queue.metadata.channel.send(userMessage).catch(console.error);

        // Log to the private log channel
        await sendGuildLog(queue.metadata.guild, `❌ **Player Error [${severity.toUpperCase()}]:** ${errorMsg}`);

        // ── Recovery: skip to next track or clean up ──────────────────────────
        try {
            if (!queue.tracks.toArray().length && queue.repeatMode !== QueueRepeatMode.AUTOPLAY) {
                queue.delete();
            } else {
                queue.node.skip();
            }
        } catch (e) {
            logger.error(`[PlayerError] Error during skip recovery: ${e.message}`);
            await sendGuildLog(queue.metadata.guild, `⚠️ **Critical Error** during skip handling: ${e.message}`);
        }
    }
};
