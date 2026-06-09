const { checkVoice } = require('../utils/voiceCheck');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Plays a song from YouTube or searches for it',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        const query = args.join(' ');
        if (!query) return message.reply("❌ Please provide a song name or YouTube link!");

        await message.reply(`🔍 Searching for **${query}**....`);

        try {
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: message.channel, controllerMsg: null },
                    selfDeaf: config.selfDeaf !== undefined ? config.selfDeaf : true,
                    volume: config.defaultVolume !== undefined ? config.defaultVolume : 80,
                    leaveOnEmpty: config.leaveOnEmpty !== undefined ? config.leaveOnEmpty : true,
                    leaveOnEmptyCooldown: config.leaveOnEmptyCooldown !== undefined ? config.leaveOnEmptyCooldown : 30000,
                    leaveOnEnd: config.leaveOnEnd !== undefined ? config.leaveOnEnd : false,
                    skipOnNoStream: true,
                }
            });
            message.channel.send(`✅ Added **${track.title}** to the queue!`);
        } catch (e) {
            console.error(e);
            message.channel.send(`❌ Error: ${e.message}`);
        }
    }
};
