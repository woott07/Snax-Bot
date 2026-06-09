const { checkVoice } = require('../utils/voiceCheck');

module.exports = {
    name: 'join',
    aliases: ['j'],
    description: 'Joins your voice channel',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        try {
            const queue = player.nodes.create(message.guild, {
                metadata: { channel: message.channel, controllerMsg: null },
                selfDeaf: config.selfDeaf !== undefined ? config.selfDeaf : true,
                volume: config.defaultVolume !== undefined ? config.defaultVolume : 80,
                leaveOnEmpty: config.leaveOnEmpty !== undefined ? config.leaveOnEmpty : true,
                leaveOnEmptyCooldown: config.leaveOnEmptyCooldown !== undefined ? config.leaveOnEmptyCooldown : 30000,
                leaveOnEnd: config.leaveOnEnd !== undefined ? config.leaveOnEnd : false,
                skipOnNoStream: true
            });
            if (!queue.connection) await queue.connect(voiceChannel);
            return message.reply(`🔊 Joined **${voiceChannel.name}**!`);
        } catch (e) {
            console.error(e);
            return message.reply(`❌ Failed to join: ${e.message}`);
        }
    }
};
