const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'loopQ',
    aliases: ['loopqueue', 'lq'],
    description: 'Toggles loop for the entire queue',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        if (kPlayer.loop === 'queue') {
            kPlayer.setLoop('none');
            return reply.neutral(message, '➡️  Queue loop **disabled**.', { ephemeral: true });
        } else {
            kPlayer.setLoop('queue');
            return reply.ok(message, `🔁  Looping the entire queue — **${kPlayer.queue.length + 1} songs**.`, { ephemeral: true });
        }
    }
};
