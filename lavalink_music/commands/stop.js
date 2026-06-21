const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'stop',
    description: 'Stops playback and clears the queue',
    async execute(message, args, client, player, config) {
        const kazagumoPlayer = player.players.get(message.guild.id);
        if (!kazagumoPlayer) return message.reply('❌ Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        // Destroy player and disconnect
        kazagumoPlayer.destroy();
        return message.reply('⏹️ Stopped. Queue cleared and disconnected.');
    }
};
