const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'skip',
    aliases: ['next', 's'],
    description: 'Skips the current song',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No song is playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        queue.node.skip();
        return message.reply('⏭️ Skipped to the next song.');
    }
};
