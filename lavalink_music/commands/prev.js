const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'prev',
    aliases: ['previous', 'back'],
    description: 'Plays the previous song from history',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        // Kazagumo doesn't have a native history — inform the user
        return reply.warn(message, '⏮️  Track history isn\'t available.\n-# Use `$queue` to jump to a specific song.');
    }
};
