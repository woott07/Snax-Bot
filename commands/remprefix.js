const { setGuildPrefix } = require('../utils/permissions');

module.exports = {
    name: 'remprefix',
    description: 'Remove custom prefix and reset to default',
    execute(message, args, client, player, config) {
        setGuildPrefix(message.guild.id, null);
        message.reply(`✅ Successfully removed custom prefix. Resetted back to default: **${config.prefix || '$'}**`);
    }
};
