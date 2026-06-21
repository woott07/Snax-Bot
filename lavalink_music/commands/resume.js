const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'resume',
    description: 'Resumes paused music playback',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer) return message.reply('❌ Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        await kPlayer.pause(false);
        return message.reply('▶️ Resumed.');
    }
};
