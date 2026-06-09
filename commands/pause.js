const { checkVoice } = require('../utils/voiceCheck');

module.exports = {
    name: 'pause',
    description: 'Pauses the music playback',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No song is playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        queue.node.pause();
        return message.reply('⏸️ Paused the playback.');
    }
};
