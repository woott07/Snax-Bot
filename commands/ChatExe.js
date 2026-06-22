const { addTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'ChatExe',
    description: 'Grant Chat permissions (purge, timeout) to a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$ChatExe @Moderator` or `$ChatExe 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const added = addTarget(message.guild.id, 'ChatExe', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (added) {
            message.reply(`✅ Granted **ChatExe** permissions to ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} already has ChatExe permissions.`);
        }
    }
};
