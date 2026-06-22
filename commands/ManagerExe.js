const { addTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'ManagerExe',
    description: 'Grant Manager permissions (ban, unban, kick) to a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$ManagerExe @Manager` or `$ManagerExe 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const added = addTarget(message.guild.id, 'ManagerExe', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (added) {
            message.reply(`✅ Granted **ManagerExe** permissions to ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} already has ManagerExe permissions.`);
        }
    }
};
