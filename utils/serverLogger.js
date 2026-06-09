const { ChannelType, PermissionFlagsBits } = require('discord.js');
const logger = require('./logger');

/**
 * Finds or creates the 'snax-log' channel in a specific guild
 */
async function getOrCreateLogChannel(guild) {
    if (!guild || !guild.channels) return null;

    let logChannel = guild.channels.cache.find(c => c.name === 'snax-log' && c.type === ChannelType.GuildText);
    
    if (!logChannel) {
        try {
            logChannel = await guild.channels.create({
                name: 'snax-log',
                type: ChannelType.GuildText,
                topic: 'Private logs for Snax Music Bot. Only admins can see this.',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id, // @everyone role
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: guild.client.user.id, // Bot itself
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
                    }
                ],
            });
            logger.success(`Created snax-log channel in guild: ${guild.name}`);
        } catch (error) {
            logger.error(`Could not create log channel in ${guild.name}: ${error.message}`);
            return null;
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
