const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'resume',
    description: 'Resumes paused music playback',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        await kPlayer.pause(false);
        return reply.ok(message, '▶️  Resumed.', { ephemeral: true });
    }
};
