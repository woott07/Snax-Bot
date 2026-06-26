const { ChannelType, EmbedBuilder } = require('discord.js');
const logger = require('./logger');
const { getGlobalSetting } = require('./settingsManager');

// Cache: guildId -> Discord channel object (so we don't refetch every time)
const channelCache = new Map();

/**
 * Get the home server (the bot's own management guild).
 */
function getHomeGuild(client) {
    const homeId = getGlobalSetting('homeServerId') || process.env.HOME_SERVER_ID;
    if (!homeId) {
        logger.warn('[GlobalLogger] Home server ID is not set — global logging disabled.');
        return null;
    }
    const guild = client.guilds.cache.get(homeId);
    if (!guild) {
        logger.warn('[GlobalLogger] Home server not found in cache. Make sure the bot is in that server.');
        return null;
    }
    return guild;
}

/**
 * Finds or creates a text channel in the home server by name.
 */
async function getOrCreateHomeChannel(client, channelName) {
    const cacheKey = `home:${channelName}`;
    if (channelCache.has(cacheKey)) return channelCache.get(cacheKey);

    const homeGuild = getHomeGuild(client);
    if (!homeGuild) return null;

    let channel = null;

    // If requesting global-log, check custom configured channel first
    if (channelName === 'global-log') {
        const customChannelId = getGlobalSetting('homeLogChannelId');
        if (customChannelId) {
            channel = homeGuild.channels.cache.get(customChannelId);
            if (!channel) {
                try {
                    channel = await homeGuild.channels.fetch(customChannelId).catch(() => null);
                } catch (e) {
                    // Ignore
                }
            }
        }
    }

    // Fallback to name search or creation
    if (!channel) {
        const safeName = channelName
            .toLowerCase()
            .replace(/[^a-z0-9\-_]/g, '-')   // replace invalid chars with dash
            .replace(/-{2,}/g, '-')            // collapse multiple dashes
            .replace(/^-|-$/g, '')             // trim leading/trailing dashes
            .substring(0, 100);

        channel = homeGuild.channels.cache.find(
            c => c.name === safeName && c.type === ChannelType.GuildText
        );

        if (!channel) {
            try {
                channel = await homeGuild.channels.create({
                    name: safeName,
                    type: ChannelType.GuildText,
                    topic: `Global log channel — managed by ${homeGuild.client.user.username}`,
                });
                logger.success(`[GlobalLogger] Created channel #${safeName} in home server.`);
            } catch (err) {
                logger.warn(`[GlobalLogger] Could not create channel #${safeName}: ${err.message}`);
                return null;
            }
        }
    }

    channelCache.set(cacheKey, channel);
    return channel;
}

/**
 * Sends a message to the #global-log channel in the home server.
 * Used for: bot joins/leaves, bot startup, global errors.
 */
async function logGlobal(client, messageOrEmbed) {
    const channel = await getOrCreateHomeChannel(client, 'global-log');
    if (!channel) return;
    try {
        if (typeof messageOrEmbed === 'string') {
            await channel.send({ content: messageOrEmbed });
        } else {
            await channel.send(messageOrEmbed);
        }
    } catch (err) {
        logger.error(`[GlobalLogger] Failed to send to #global-log: ${err.message}`);
    }
}

/**
 * Sends a message to a per-server channel in the home server.
 * Channel is named after the target guild's name.
 * Used for: that server's errors, join/leave events for that server.
 *
 * @param {Client} client
 * @param {Guild}  targetGuild  - the guild this log is about
 * @param {string|object} messageOrEmbed
 */
async function logForServer(client, targetGuild, messageOrEmbed) {
    if (!targetGuild) return;

    // Don't log the home server to itself via per-server channel — use #global-log for that
    const homeId = process.env.HOME_SERVER_ID;
    if (targetGuild.id === homeId) {
        return logGlobal(client, messageOrEmbed);
    }

    const channelName = targetGuild.name; // sanitized inside getOrCreateHomeChannel
    const channel = await getOrCreateHomeChannel(client, channelName);
    if (!channel) return;
    try {
        if (typeof messageOrEmbed === 'string') {
            await channel.send({ content: messageOrEmbed });
        } else {
            await channel.send(messageOrEmbed);
        }
    } catch (err) {
        logger.error(`[GlobalLogger] Failed to send to #${channelName}: ${err.message}`);
    }
}

/**
 * Builds a clean embed for a guild join/leave event.
 */
function buildGuildEmbed({ type, guild, inviter }) {
    const isJoin = type === 'join';
    const embed = new EmbedBuilder()
        .setColor(isJoin ? 0x57F287 : 0xED4245)  // green for join, red for leave
        .setTitle(isJoin ? '📥 Bot Added to Server' : '📤 Bot Removed from Server')
        .addFields(
            { name: '🏠 Server Name', value: guild.name, inline: true },
            { name: '🆔 Server ID',   value: guild.id,   inline: true },
            { name: '👥 Member Count', value: String(guild.memberCount || '?'), inline: true },
        )
        .setThumbnail(guild.iconURL({ dynamic: true }) || null)
        .setTimestamp();

    if (isJoin && inviter) {
        embed.addFields({ name: '👤 Added By', value: `${inviter.tag} (${inviter.id})`, inline: false });
    }

    return embed;
}

/**
 * Builds an error embed for a specific server.
 */
function buildErrorEmbed({ guild, context, error }) {
    return new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('⚠️ Error Occurred')
        .addFields(
            { name: '📍 Context', value: context || 'Unknown', inline: false },
            { name: '❌ Error',   value: `\`\`\`${String(error).substring(0, 1000)}\`\`\``, inline: false },
        )
        .setFooter({ text: `Server: ${guild?.name || 'Unknown'} (${guild?.id || '?'})` })
        .setTimestamp();
}

module.exports = {
    logGlobal,
    logForServer,
    buildGuildEmbed,
    buildErrorEmbed,
    getOrCreateHomeChannel,
};
