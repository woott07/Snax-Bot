const { ChannelType } = require('discord.js');
const logger = require('./logger');
const { getGuildSetting } = require('./settingsManager');

/**
 * Finds the configured log channel in a specific guild
 */
async function getOrCreateLogChannel(guild) {
    if (!guild || !guild.channels) return null;

    const channelId = getGuildSetting(guild.id, 'logChannelId');
    if (!channelId) return null;

    let logChannel = guild.channels.cache.get(channelId);
    if (!logChannel) {
        try {
            logChannel = await guild.channels.fetch(channelId).catch(() => null);
        } catch (e) {
            // ignore
        }
    }
    return logChannel;
}

/**
 * Sends a message to the guild's log channel
 */
async function sendGuildLog(guild, messageOrEmbed) {
    const channel = await getOrCreateLogChannel(guild);
    if (channel) {
        try {
            if (typeof messageOrEmbed === 'string') {
                await channel.send({ content: messageOrEmbed });
            } else {
                await channel.send(messageOrEmbed);
            }
        } catch (e) {
            logger.error(`Could not send log to ${guild.name}: ${e.message}`);
        }
    }
}

module.exports = {
    getOrCreateLogChannel,
    sendGuildLog
};
