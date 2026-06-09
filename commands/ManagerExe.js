const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'ManagerExe',
    description: 'Grant Manager permissions (ban, unban, kick) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$ManagerExe @Manager`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'ManagerExe', target.id);
        if (added) {
            message.reply(`✅ Granted **ManagerExe** permissions to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has ManagerExe permissions.`);
        }
    }
};
