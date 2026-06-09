module.exports = {
    name: 'unmute',
    description: 'Server unmutes a user in a Voice Channel',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to unmute. Example: `$unmute @user`');
        }

        if (!target.voice.channel) {
            return message.reply(`❌ **${target.user.username}** is not in a Voice Channel!`);
        }

        try {
            await target.voice.setMute(false, `Unmuted by ${message.author.tag}`);
            message.reply(`🔊 Successfully unmuted **${target.user.username}**.`);
        } catch (error) {
            console.error('Error unmuting member:', error);
            message.reply('❌ Failed to unmute the user. Check my permissions (Mute Members) and role hierarchy.');
        }
    }
};
