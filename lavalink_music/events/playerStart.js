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
        if (channelId) {
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                // Delete old controller if exists
                const oldMsg = player.data.get('controllerMsg');
                if (oldMsg) oldMsg.delete().catch(() => {});

                const embed = createQueueEmbed(player, config, false);
                const row = createActionRow(false);

                if (embed) {
                    const msg = await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
                    if (msg) player.data.set('controllerMsg', msg);
                }
            }
        }

        // Send server log if guild is available
        const guild = client.guilds.cache.get(player.guildId);
        if (guild && channelId) {
            await sendGuildLog(guild, `▶️ Started playing: **${track.title}** in <#${channelId}>`).catch(() => {});
        }
        // set custom status of the bot as the song playing
        if (player.voiceId) {client.rest.put(`/channels/${player.voiceId}/voice-status`,
            {body:{status:`🎶 Playing: ${track.title}`.substring(0, 500)
        }}).catch((err)=>{logger.error(`Failed to set voice status: ${err.message}`);})}
}
};
