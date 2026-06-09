const { setGuildPrefix } = require('../utils/permissions');

module.exports = {
    name: 'setprefix',
    description: 'Change the custom prefix for this server',
    execute(message, args) {
        if (!args[0]) {
            return message.reply('❌ Please provide a new prefix. Example: `$setprefix !`');
        }

        const newPrefix = args[0];
        
        if (newPrefix.length > 3) {
            return message.reply('❌ Prefix cannot be longer than 3 characters.');
        }

        setGuildPrefix(message.guild.id, newPrefix);
        message.reply(`✅ Successfully changed the server prefix to **${newPrefix}**`);
    }
};
