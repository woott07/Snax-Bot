const { Events, AuditLogEvent } = require('discord.js');
const { getOrCreateLogChannel, sendGuildLog, checkAndLogRoleHierarchy } = require('../utils/serverLogger');
const { logGlobal, logForServer, buildGuildEmbed } = require('../utils/globalLogger');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, client, player, config) {
        logger.info(`[GuildCreate] Bot joined: ${guild.name} (${guild.id})`);

        // 1. Create the in-server snax-log channel (existing behaviour)
        await getOrCreateLogChannel(guild);
        await sendGuildLog(guild,
            `👋 Hello! Thanks for adding **${client.user.username}** to your server.\n` +
            `I've created this private channel to log important bot activities and errors.\n` +
            `My prefix is \`$\` — for more info type \`$help\``
        );
        await checkAndLogRoleHierarchy(guild);

        // 2. Try to find who added the bot via audit log
        let inviter = null;
        try {
            await guild.members.fetch(); // ensure cache is ready
            const auditLogs = await guild.fetchAuditLogs({
                type: AuditLogEvent.BotAdd,
                limit: 5,
            });
            const entry = auditLogs.entries.find(e => e.target?.id === client.user.id);
            if (entry) inviter = entry.executor;
        } catch (err) {
            logger.warn(`[GuildCreate] Could not fetch audit log for ${guild.name}: ${err.message}`);
        }

        // 3. Log to home server's #global-log
        const globalEmbed = buildGuildEmbed({ type: 'join', guild, inviter });
        await logGlobal(client, { embeds: [globalEmbed] });

        // 4. Create a per-server channel in home server and post initial log
        await logForServer(client, guild,
            `✅ Bot joined this server **${guild.name}** (\`${guild.id}\`).\n` +
            (inviter ? `👤 Added by: **${inviter.tag}** (\`${inviter.id}\`)` : '👤 Added by: *Unknown (no audit log access)*')
        );
    }
};
