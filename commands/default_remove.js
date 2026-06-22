const { removeTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'default_remove',
    description: 'Remove default/music commands access from a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$default_remove @everyone` or `$default_remove @DJ`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const removed = removeTarget(message.guild.id, 'Default', target.id);
        const mention = target.isEveryone ? '@everyone' : (target.isRole ? `<@&${target.id}>` : `<@${target.id}>`);
        
        if (removed) {
            message.reply(`✅ Revoked **Default** command access from ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} does not have Default access.`);
        }
    }
};
