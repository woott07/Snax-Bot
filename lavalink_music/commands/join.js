const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'join',
    aliases: ['j'],
    description: 'Joins your voice channel',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        try {
            let kPlayer = player.players.get(message.guild.id);
            if (!kPlayer) {
                kPlayer = await player.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: voiceChannel.id,
                    deaf: config.selfDeaf !== undefined ? config.selfDeaf : true
                });
            }
            kPlayer.data.set('channelId', message.channel.id);
            return message.reply(`🔊 Joined **${voiceChannel.name}**!`);
        } catch (e) {
            console.error(e);
            return message.reply(`❌ Failed to join: ${e.message}`);
        }
    }
};
