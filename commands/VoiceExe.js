const { addTarget } = require('../utils/permissions');

module.exports = {
    name: 'VoiceExe',
    description: 'Grant Voice Management permissions (mute, deafen, etc.) to a role or user',
    execute(message, args) {
        if (!args[0]) return message.reply('❌ Please mention a role or user. Example: `$VoiceExe @Moderator`');

        const target = message.mentions.roles.first() || message.mentions.users.first();
        if (!target) return message.reply('❌ Could not find that role or user.');

        const added = addTarget(message.guild.id, 'VoiceExe', target.id);
        if (added) {
            message.reply(`✅ Granted **VoiceExe** permissions to ${target}`);
        } else {
            message.reply(`⚠️ ${target} already has VoiceExe permissions.`);
        }
    }
};
