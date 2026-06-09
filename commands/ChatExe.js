const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'ChatExe',
    description: 'Grant Chat permissions (purge, timeout) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$ChatExe @Moderator`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'ChatExe', target.id);
        if (added) {
            message.reply(`✅ Granted **ChatExe** permissions to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has ChatExe permissions.`);
        }
    }
};
