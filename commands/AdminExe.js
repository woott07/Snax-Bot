const { addTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'AdminExe',
    description: 'Grant Admin permissions (to assign/revoke roles) to a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$AdminExe @Manager` or `$AdminExe 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const added = addTarget(message.guild.id, 'AdminExe', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (added === 'pending') {
            message.reply(`⏳ **Pending Admin Assignment**: ${mention} has been registered. Full Admin powers will unlock automatically in **10 minutes**.`);
        } else if (added === 'already_admin') {
            message.reply(`⚠️ ${mention} is already a full Admin.`);
        } else if (added) {
            message.reply(`✅ Granted **AdminExe** permissions to ${mention}`);
        } else {
            message.reply(`⚠️ Could not grant AdminExe.`);
        }
    }
};
