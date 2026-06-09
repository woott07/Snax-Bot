const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'AdminExe',
    description: 'Grant Admin permissions (to assign/revoke roles) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$AdminExe @Manager`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'AdminExe', target.id);
        if (added === 'pending') {
            message.reply(`⏳ **Pending Admin Assignment**: ${target} has been registered. Full Admin powers will unlock automatically in **10 minutes**.`);
        } else if (added === 'already_admin') {
            message.reply(`⚠️ ${target} is already a full Admin.`);
        } else if (added) {
            message.reply(`✅ Granted **AdminExe** permissions to ${target}`);
        } else {
            message.reply(`⚠️ Could not grant AdminExe.`);
        }
    }
};
