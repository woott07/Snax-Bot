const { checkVoice } = require('../utils/voiceCheck');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    name: 'autoplay',
    description: 'Toggles autoplay mode',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No music playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return message.reply('🛑 Autoplay **disabled**.');
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
            return message.reply('🤖 Autoplay **enabled**!');
        }
    }
};
