const { addTarget, resolveTarget } = require('../utils/permissions');

module.exports = {
    name: 'assign_default',
    description: 'Grant default/music commands access to a role or user',
    async execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role/user or provide their ID. Example: `$assign_default @DJ` or `$assign_default @everyone`');

        const target = await resolveTarget(message, args[0]);
        if (!target) return message.reply('❌ Could not find that role or user in this server.');

        const added = addTarget(message.guild.id, 'Default', target.id);
        const mention = target.isEveryone ? '@everyone' : (target.isRole ? `<@&${target.id}>` : `<@${target.id}>`);
        
        if (added) {
            message.reply(`✅ Granted **Default** command access to ${mention}`);
        } else {
            message.reply(`⚠️ ${mention} already has Default access.`);
        }
    }
};
