const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'autoplay',
    description: 'Toggles autoplay — plays related songs when queue ends',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return message.reply('❌ Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const current = kPlayer.data.get('autoplay') || false;
        kPlayer.data.set('autoplay', !current);

        if (!current) {
            return message.reply('` 🤖 Autoplay **on** `');
        } else {
            return message.reply('` 🛑 Autoplay **off** `');
        }
    }
};

