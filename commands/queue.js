const { checkVoice } = require('../utils/voiceCheck');
const { createQueueEmbed, createActionRow } = require('../embeds/playerEmbed');

module.exports = {
    name: 'queue',
    aliases: ['q', 'interface'],
    description: 'Shows the current queue and media controller UI',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No song currently playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const embed = createQueueEmbed(queue, config, false);
        const row = createActionRow(false);

        if (embed) await message.reply({ embeds: [embed], components: [row] });
    }
};
