const logger = require('../../utils/logger');
const { sendGuildLog } = require('../../utils/serverLogger');
const { createQueueEmbed, createActionRow } = require('../embeds');

module.exports = {
    name: 'playerStart',
    async execute(player, track, client, kazagumo, config) {
        logger.info(`▶️ [Lavalink] Started playing: ${track.title}`);

        // Store last played track for autoplay
        player.data.set('lastTrack', track);
        const channelId = player.data.get('channelId');
        const guild = client.guilds.cache.get(player.guildId);
        
        let logChannel = null;
        if (guild) {
            try {
                const { getOrCreateLogChannel } = require('../../utils/serverLogger');
                logChannel = await getOrCreateLogChannel(guild);
            } catch (e) {
                logger.error(`Error resolving log channel: ${e.message}`);
            }
        }

        const commandChannel = channelId ? client.channels.cache.get(channelId) : null;

        // Reset expanded state for new song
        player.data.set('isExpanded', false);

        // Delete old controller messages
        const oldCmdMsg = player.data.get('controllerMsg');
        if (oldCmdMsg) oldCmdMsg.delete().catch(() => {});
        const oldLogMsg = player.data.get('logControllerMsg');
        if (oldLogMsg) oldLogMsg.delete().catch(() => {});

        const embed = createQueueEmbed(player, config, false);
        const row = createActionRow(false);

        if (embed) {
            // 1. Send to original command channel
            if (commandChannel) {
                const msg = await commandChannel.send({ embeds: [embed], components: [row] }).catch(() => null);
                if (msg) player.data.set('controllerMsg', msg);
            }

            // 2. Send to custom log channel if configured and is different
            if (logChannel && (!commandChannel || logChannel.id !== commandChannel.id)) {
                const msg = await logChannel.send({ embeds: [embed], components: [row] }).catch(() => null);
                if (msg) player.data.set('logControllerMsg', msg);
            }
        }
        // set custom status of the bot as the song playing
        if (player.voiceId) {client.rest.put(`/channels/${player.voiceId}/voice-status`,
            {body:{status:`🎶 Playing: ${track.title}`.substring(0, 500)
        }}).catch((err)=>{logger.error(`Failed to set voice status: ${err.message}`);})}
}
};
