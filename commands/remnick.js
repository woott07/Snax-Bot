const { resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'remnick',
    description: 'Removes the nickname of a user or the bot itself',
    async execute(message, args) {
        let targetMember = message.guild.members.me;
        let targetUser = null;

        if (args[0]) {
            const target = await resolveTarget(message, args[0]);
            if (!target || !target.isUser) {
                return message.reply('❌ Could not find that user in this server.');
            }
            targetMember = target.member;
            targetUser = target.member.user;
        }

        if (targetUser) {
            // Check if target is guild owner
            if (targetMember.id === message.guild.ownerId) {
                return message.reply(`❌ I cannot change/remove the nickname of the server owner!`);
            }
            // Check if bot can change this user's nickname (role hierarchy)
            if (targetMember.id !== message.guild.members.me.id && targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply(`❌ I cannot change the nickname of **${targetUser.username}** because their role is higher than or equal to mine!`);
            }
        }

        // Check if there is actually a nickname to remove
        if (!targetMember.nickname) {
            const subject = targetUser ? `**${targetUser.username}**` : 'I';
            return message.reply(`⚠️ ${subject} do not have a custom nickname to remove.`);
        }

        try {
            await targetMember.setNickname(null);
            const subject = targetUser ? `for **${targetUser.username}**` : 'for myself';
            message.reply(`✅ Successfully removed custom nickname ${subject}.`);
        } catch (error) {
            console.error('Error removing nickname:', error);
            message.reply('❌ An error occurred while trying to remove the nickname. Make sure I have proper permissions.');
        }
    }
};
