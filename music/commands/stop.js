const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'stop',
    description: 'Stops the playback and clears the queue',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) return message.reply('❌ No music playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        queue.delete();
        return message.reply('🛑 Playback terminated and queue cleared.');
    }
};
