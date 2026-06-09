const { createQueueEmbed, createActionRow } = require('../embeds/playerEmbed');
const { sendGuildLog } = require('../utils/serverLogger');

module.exports = {
    name: 'playerStart',
    isPlayer: true,
    async execute(queue, track, client, player, config) {
        // Safely delete the old controller message to keep chat clean
        if (queue.metadata.controllerMsg) {
            queue.metadata.controllerMsg.delete().catch(() => { });
            queue.metadata.controllerMsg = null;
        }

        const embed = createQueueEmbed(queue, config, false);
        const row = createActionRow(false);

        if (embed) {
            queue.metadata.channel.send({ embeds: [embed], components: [row] })
                .then(msg => { queue.metadata.controllerMsg = msg; })
                .catch(console.error);
        }
        
        // Log to the private log channel
        await sendGuildLog(queue.metadata.guild, `▶️ Started playing: **${track.title}** in <#${queue.metadata.channel.id}>`);
    }
};
