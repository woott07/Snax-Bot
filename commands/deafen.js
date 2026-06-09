module.exports = {
    name: 'deafen',
    description: 'Server deafens a user in a Voice Channel',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to deafen. Example: `$deafen @user`');
        }

        if (!target.voice.channel) {
            return message.reply(`❌ **${target.user.username}** is not in a Voice Channel!`);
        }

        try {
            await target.voice.setDeaf(true, `Deafened by ${message.author.tag}`);
            message.reply(`🔕 Successfully server-deafened **${target.user.username}**.`);
        } catch (error) {
            console.error('Error deafening member:', error);
            message.reply('❌ Failed to deafen the user. Check my permissions (Deafen Members) and role hierarchy.');
        }
    }
};
