const { addTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'SupBypass',
    description: 'Grant SupBypass permissions (immune to spam limit) to a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$SupBypass @VIP` or `$SupBypass 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const added = addTarget(message.guild.id, 'SupBypass', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (added) {
            message.reply(`✅ Granted **SupBypass** (Spam Immunity) to ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} already has SupBypass.`);
        }
    }
};
