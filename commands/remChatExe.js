const { removeTarget } = require('../utils/permissions');

module.exports = {
    name: 'remChatExe',
    description: 'Remove Chat permissions from a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$remChatExe @Moderator`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const removed = removeTarget(message.guild.id, 'ChatExe', target.id);
        if (removed) {
            message.reply(`✅ Revoked **ChatExe** permissions from ${target}`);
        } else {
            message.reply(`⚠️ ${target} does not have ChatExe permissions.`);
        }
    }
};
