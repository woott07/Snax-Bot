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

async function checkAndLogRoleHierarchy(guild) {
    if (!guild || !guild.members) return;

    try {
        const me = guild.members.me || await guild.members.fetch(guild.client.user.id).catch(() => null);
        if (!me) return;

        const hasRolePermission = me.permissions.has(PermissionFlagsBits.ManageRoles) || 
                                 me.permissions.has(PermissionFlagsBits.Administrator);
                                 
        if (!hasRolePermission) return;

        const botHighestRolePosition = me.roles.highest.position;

        const rolesAbove = guild.roles.cache.filter(role => 
            role.position > botHighestRolePosition && 
            !role.managed && 
            role.name !== '@everyone'
        );

        if (rolesAbove.size > 0) {
            const roleNames = rolesAbove.map(r => r.name).join(', ');
            await sendGuildLog(guild, 
                `⚠️ **Role Hierarchy Warning**: My highest role (**${me.roles.highest.name}**) is currently below the following roles: **${roleNames}**.\n` +
                `Please go to **Server Settings > Roles** and drag my role as high as possible so I can successfully moderate members and change nicknames.`
            );
        }
    } catch (err) {
        logger.error(`Error checking role hierarchy in ${guild.name}: ${err.message}`);
    }
}

module.exports = {
    getOrCreateLogChannel,
    sendGuildLog,
    checkAndLogRoleHierarchy
};
