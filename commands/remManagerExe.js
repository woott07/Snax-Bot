const { removeTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'remManagerExe',
    description: 'Remove Manager permissions from a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$remManagerExe @Manager` or `$remManagerExe 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const removed = removeTarget(message.guild.id, 'ManagerExe', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (removed) {
            message.reply(`✅ Revoked **ManagerExe** permissions from ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} does not have ManagerExe permissions.`);
        }
    }
};
