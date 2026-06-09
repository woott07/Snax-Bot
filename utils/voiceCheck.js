/**
 * Helper utility to validate voice channel requirements
 * Checks if the user is in a voice channel, and if sameVoiceRequired config is true,
 * ensures they are in the same channel as the bot.
 */
function checkVoice(message, config) {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
        return {
            valid: false,
            message: '❌ You need to join a voice channel first!'
        };
    }

    const botVoiceChannelId = message.guild.members.me?.voice.channelId;
    if (config.permissions?.sameVoiceRequired && botVoiceChannelId && voiceChannel.id !== botVoiceChannelId) {
        return {
            valid: false,
            message: '❌ You must be in the same voice channel as me to use this command!'
        };
    }

    return {
        valid: true,
        channel: voiceChannel
    };
}

module.exports = { checkVoice };
