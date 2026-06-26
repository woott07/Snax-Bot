const { Events, AuditLogEvent, ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logGlobal, logForServer, buildGuildEmbed } = require('../utils/globalLogger');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, client, player, config) {
        logger.info(`[GuildCreate] Bot joined: ${guild.name} (${guild.id})`);

        // 1. Send greeting message to system channel or first writeable channel
        const pinkColor = config.embedColor || config.embed?.color || '#FF8DA1';
        const welcomeEmbed = new EmbedBuilder()
            .setColor(pinkColor)
            .setTitle(`👋 Thanks for adding ${client.user.username}!`)
            .setDescription(
                `To set up the music log channel, please have the **Server Owner**, **Bot Owner**, or an **Administrator** run the command:\n` +
                `\`$setup\`\n\n` +
                `This will open an interactive menu to select the log channel where the bot will log what is playing and other bot events.`
            )
            .setFooter({ text: 'Snax Music Bot Setup' })
            .setTimestamp();

        let welcomeChannel = guild.systemChannel;
        if (!welcomeChannel || !welcomeChannel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
            welcomeChannel = guild.channels.cache.find(
                c => c.type === ChannelType.GuildText && c.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)
            );
        }

        if (welcomeChannel) {
            await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
        }

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
