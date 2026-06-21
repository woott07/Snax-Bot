const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'pause',
    description: 'Pauses the music playback',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        await kPlayer.pause(true);
        return reply.ok(message, '⏸️  Paused.\n-# Use `$resume` to continue.', { ephemeral: true });
    }
};
