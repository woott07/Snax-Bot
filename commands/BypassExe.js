const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'BypassExe',
    description: 'Grant Bypass permissions (spam limit increased) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$BypassExe @Trusted`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'BypassExe', target.id);
        if (added) {
            message.reply(`✅ Granted **BypassExe** (Increased Spam Limit) to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has BypassExe.`);
        }
    }
};
