const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'stop',
    description: 'Stops playback and clears the queue',
    async execute(message, args, client, player, config) {
        const kazagumoPlayer = player.players.get(message.guild.id);
        if (!kazagumoPlayer) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        kazagumoPlayer.destroy();
        return reply.neutral(message, '⏹️  Stopped — queue cleared and disconnected.', { ephemeral: true });
    }
};
