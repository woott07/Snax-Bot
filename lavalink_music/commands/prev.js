const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'prev',
    aliases: ['previous', 'back'],
    description: 'Plays the previous song from history',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer) return message.reply('❌ Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        // Kazagumo doesn't have a native history — we inform the user
        return message.reply('⏮️ Track history isn\'t available. Use `$queue` to jump to a specific song.');
    }
};
