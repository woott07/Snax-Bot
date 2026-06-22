const logger = require('../../utils/logger');

module.exports = {
    name: 'playerDestroy',
    async execute(player, client, kazagumo, config) {
        logger.info(`⏹️ [Lavalink] Player destroyed in guild ${player.guildId}`);

        // Clear the Voice Channel status
        if (player.voiceId) {
            client.rest.put(`/channels/${player.voiceId}/voice-status`, {
                body: { status: "" }
            }).catch(() => {});
        }
    }
};
