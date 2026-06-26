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

        // Delete active controller embeds
        const oldCmdMsg = player.data.get('controllerMsg');
        if (oldCmdMsg) oldCmdMsg.delete().catch(() => {});
        const oldLogMsg = player.data.get('logControllerMsg');
        if (oldLogMsg) oldLogMsg.delete().catch(() => {});
    }
};
