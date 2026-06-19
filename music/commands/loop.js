const { checkVoice } = require('../../utils/voiceCheck');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    name: 'loop',
    description: 'Cycles through repeat modes: Off, Track, Queue',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No music playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        if (queue.repeatMode === QueueRepeatMode.OFF) {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            return message.reply('🔂 Looping the **current track**.');
        }
        else if (queue.repeatMode === QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
            return message.reply('🔁 Looping the **entire queue**.');
        }
        else {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return message.reply('➡️ Looping **disabled**.');
        }
    }
};
