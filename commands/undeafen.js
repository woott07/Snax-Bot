module.exports = {
    name: 'undeafen',
    description: 'Server undeafens a user in a Voice Channel',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to undeafen. Example: `$undeafen @user`');
        }

        if (!target.voice.channel) {
            return message.reply(`❌ **${target.user.username}** is not in a Voice Channel!`);
        }

        try {
            await target.voice.setDeaf(false, `Undeafened by ${message.author.tag}`);
            message.reply(`🔔 Successfully undeafened **${target.user.username}**.`);
        } catch (error) {
            console.error('Error undeafening member:', error);
            message.reply('❌ Failed to undeafen the user. Check my permissions (Deafen Members) and role hierarchy.');
        }
    }
};
