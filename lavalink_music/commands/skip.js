const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'skip',
    aliases: ['next', 's'],
    description: 'Skips the current song',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        await kPlayer.skip();
        return reply.ok(message, '⏭️  Skipped to the next song.', { ephemeral: true });
    }
};
