const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'SupBypass',
    description: 'Grant SupBypass permissions (immune to spam limit) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$SupBypass @VIP`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'SupBypass', target.id);
        if (added) {
            message.reply(`✅ Granted **SupBypass** (Spam Immunity) to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has SupBypass.`);
        }
    }
};
