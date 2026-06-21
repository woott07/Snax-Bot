const { Events } = require('discord.js');
const { logGlobal, logForServer, buildGuildEmbed } = require('../utils/globalLogger');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild, client, player, config) {
        logger.warn(`[GuildDelete] Bot removed from: ${guild.name} (${guild.id})`);

        // 1. Log to home server's #global-log
        const globalEmbed = buildGuildEmbed({ type: 'leave', guild, inviter: null });
        await logGlobal(client, { embeds: [globalEmbed] });

        // 2. Log to the per-server channel in home server
        await logForServer(client, guild,
            `🚪 Bot was **removed** from **${guild.name}** (\`${guild.id}\`) — channel kept for history.`
        );
    }
};
