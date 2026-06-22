const { removeTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'remNickExe',
    description: 'Remove Setnick permissions from a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$remNickExe @Moderator` or `$remNickExe 123456789012345678`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const removed = removeTarget(message.guild.id, 'setNickExe', target.id);
        const mention = target.isRole ? `<@&${target.id}>` : `<@${target.id}>`;
        
        if (removed) {
            message.reply(`✅ Revoked **setNickExe** permissions from ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} does not have setNickExe permissions.`);
        }
    }
};
