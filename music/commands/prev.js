const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'prev',
    aliases: ['previous', 'back'],
    description: 'Plays the previous song from history',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) return message.reply('❌ No queue found!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        if (queue.history.isEmpty()) return message.reply('❌ There is no previous song history!');

        await queue.history.previous();
        return message.reply('⏮️ Playing the previous song!');
    }
};
