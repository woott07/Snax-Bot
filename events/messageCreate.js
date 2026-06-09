const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client, player, config) {
        if (message.author.bot) return;

        const prefix = config.prefix || '$';
        const mentionPrefix = new RegExp(`^<@!?${client.user.id}>\\s*`);
        const isMention = mentionPrefix.test(message.content);
        const isPrefix = message.content.startsWith(prefix);

        if (!isMention && !isPrefix) return;

        let content;
        if (isMention) {
            content = message.content.replace(mentionPrefix, '').trim();
            if (!content) {
                return message.reply(`👋 Hi! Use \`${prefix}play <song>\` or mention me like \`@${client.user.username} play <song>\`.`);
            }
        } else {
            content = message.content.slice(prefix.length).trim();
        }

        const args = content.split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Find the command by name or aliases
        const command = client.commands.get(commandName) || 
                        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            await command.execute(message, args, client, player, config);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.reply('⚠️ There was an error trying to execute that command!');
        }
    }
};
