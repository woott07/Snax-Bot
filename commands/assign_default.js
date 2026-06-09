const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'assign_default',
    description: 'Grant default/music commands access to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$assign_default @DJ`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) {
            // Also allow the literal string "@everyone" for the default target
            if (args[0] === '@everyone') {
                const added = addTarget(message.guild.id, 'Default', '@everyone');
                if (added) {
                    return message.reply(`✅ Granted **Default** command access to @everyone`);
                } else {
                    return message.reply(`⚠️ @everyone already has Default access.`);
                }
            }
            return message.reply('❌ Could not find that role or user.');
        }

        const added = addTarget(message.guild.id, 'Default', target.id);
        if (added) {
            message.reply(`✅ Granted **Default** command access to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has Default access.`);
        }
    }
};
