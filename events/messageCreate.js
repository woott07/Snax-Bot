const { Events } = require('discord.js');
const { checkSpam } = require('../utils/antiSpam');
const { hasPermission, getGuildPrefix } = require('../utils/permissions');
const { logForServer, buildErrorEmbed } = require('../utils/globalLogger');
const reply = require('../utils/reply');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client, player, config) {
        if (message.author.bot || !message.guild) return;

        // Anti-spam check (returns true if action was taken / user timed out)
        if (checkSpam(message)) return;

        // Determine prefix (Custom Guild Prefix > Default Config Prefix > '$')
        const prefix = getGuildPrefix(message.guild.id) || config.prefix || '$';
        const mentionPrefix = new RegExp(`^<@!?${client.user.id}>\\s*`);
        const isMention = mentionPrefix.test(message.content);
        const isPrefix = message.content.startsWith(prefix);

        if (!isMention && !isPrefix) return;

        let content;
        if (isMention) {
            content = message.content.replace(mentionPrefix, '').trim();
            if (!content) {
                return reply.info(message, `👋  Hi! Use \`${prefix}play <song>\` to play music\n-# or mention me like \`@${client.user.username} play <song>\``);
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

        // Custom RBAC Permission Check
        if (!hasPermission(message, command.name)) {
            return reply.err(message, '🔒  You don\'t have permission to use this command.');
        }

        try {
            await command.execute(message, args, client, player, config);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            reply.err(message, '⚠️  Something went wrong running that command.\n-# Try again or contact an admin if it keeps happening.');

            // Log error to the per-server channel in home server
            const errorEmbed = buildErrorEmbed({
                guild: message.guild,
                context: `Command: \`${commandName}\` used by ${message.author.tag}`,
                error: error.stack || error.message || error,
            });
            await logForServer(client, message.guild, { embeds: [errorEmbed] });
        }
    }
};
