module.exports = {
    name: 'mute',
    description: 'Server mutes a user in a Voice Channel',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to mute. Example: `$mute @user`');
        }

        if (!target.voice.channel) {
            return message.reply(`❌ **${target.user.username}** is not in a Voice Channel!`);
        }

        try {
            await target.voice.setMute(true, `Muted by ${message.author.tag}`);
            message.reply(`🔇 Successfully server-muted **${target.user.username}**.`);
        } catch (error) {
            console.error('Error muting member:', error);
            message.reply('❌ Failed to mute the user. Check my permissions (Mute Members) and role hierarchy.');
        }
    }
};
