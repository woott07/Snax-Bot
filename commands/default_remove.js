const { removeTarget } = require('../utils/permissions');

module.exports = {
    name: 'default_remove',
    description: 'Remove default/music commands access from a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$default_remove @everyone`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) {
            // Check for the literal string "@everyone"
            if (args[0] === '@everyone') {
                const removed = removeTarget(message.guild.id, 'Default', '@everyone');
                if (removed) {
                    return message.reply(`✅ Revoked **Default** command access from @everyone`);
                } else {
                    return message.reply(`⚠️ @everyone does not have Default access.`);
                }
            }
            return message.reply('❌ Could not find that role or user.');
        }

        const removed = removeTarget(message.guild.id, 'Default', target.id);
        if (removed) {
            message.reply(`✅ Revoked **Default** command access from ${target}`);
        } else {
            message.reply(`⚠️ ${target} does not have Default access.`);
        }
    }
};
