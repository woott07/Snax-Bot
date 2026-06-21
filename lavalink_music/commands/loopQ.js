const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'loopQ',
    aliases: ['loopqueue', 'lq'],
    description: 'Toggles loop for the entire queue',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return message.reply('❌ No music playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        if (kPlayer.loop === 'queue') {
            kPlayer.setLoop('none');
            return message.reply('➡️ Queue loop **disabled**.');
        } else {
            kPlayer.setLoop('queue');
            return message.reply(`🔁 Now looping the **entire queue** (${kPlayer.queue.length + 1} songs).`);
        }
    }
};
