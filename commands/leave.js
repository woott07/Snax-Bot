const { checkVoice } = require('../utils/voiceCheck');

module.exports = {
    name: 'leave',
    aliases: ['l'],
    description: 'Leaves the voice channel',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) return message.reply("❌ I'm not in a voice channel!");

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        queue.delete();
        return message.reply('👋 Left the voice channel!');
    }
};
