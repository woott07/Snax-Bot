const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'autoplay',
    description: 'Toggles autoplay — plays related songs when queue ends',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        const current = kPlayer.data.get('autoplay') || false;
        kPlayer.data.set('autoplay', !current);

        if (!current) {
            return reply.ok(message, '🤖  Autoplay **on** — I\'ll queue related songs when the queue ends.', { ephemeral: true });
        } else {
            return reply.neutral(message, '🛑  Autoplay **off**.', { ephemeral: true });
        }
    }
};
