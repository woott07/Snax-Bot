const { resolveTarget, getTargetPermissions } = require('../utils/permissions');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fetch',
    description: 'Fetch the bot permissions assigned to a user or role',
    async execute(message, args, client, player, config) {
        if (!args[0]) {
            return message.reply('❌ Please mention a user/role or provide their ID. Example: `$fetch @user` or `$fetch @role`');
        }

        const target = await resolveTarget(message, args[0]);
        if (!target) {
            return message.reply('❌ Could not find that role or user in this server.');
        }

        if (target.isUser && target.id === config.ownerId) {
            return message.reply("` ! Dev ! `");
        }

        const embed = new EmbedBuilder()
            .setColor(config.embed?.color || '#2b2d31')
            .setTimestamp();

        if (target.isEveryone) {
            const perms = getTargetPermissions(message.guild.id, '@everyone');
            embed.setTitle('📊 Permissions for @everyone')
                .setDescription(perms.length > 0 ? perms.map(p => `• **${p}**`).join('\n') : '*No permissions assigned.*');
            return message.reply({ embeds: [embed] });
        }

        if (target.isRole) {
            const perms = getTargetPermissions(message.guild.id, target.id);
            embed.setTitle(`📊 Permissions for Role: ${target.displayName}`)
                .setDescription(perms.length > 0 ? perms.map(p => `• **${p}**`).join('\n') : '*No direct permissions assigned to this role.*');
            return message.reply({ embeds: [embed] });
        }

        if (target.isUser) {
            const member = target.member;
            
            // Check Server Owner
            const isGuildOwner = message.guild.ownerId === member.id;
            
            const directPerms = getTargetPermissions(message.guild.id, member.id);
            
            const rolePerms = [];
            for (const role of member.roles.cache.values()) {
                if (role.name === '@everyone') continue;
                const perms = getTargetPermissions(message.guild.id, role.id);
                if (perms.length > 0) {
                    rolePerms.push(`• **${role.name}**: ${perms.join(', ')}`);
                }
            }

            embed.setTitle(`📊 Permissions for User: ${member.user.username}`);

            const descriptionLines = [];
            
            // Special Overrides
            if (isGuildOwner) {
                descriptionLines.push('**Special Privilege Overrides**:', '🏠 **Server Owner Override** (Full Bypass)', '');
            }

            // Direct Permissions
            descriptionLines.push('**Direct User Permissions**:');
            if (directPerms.length > 0) {
                descriptionLines.push(...directPerms.map(p => `• **${p}**`));
            } else {
                descriptionLines.push('*No direct permissions assigned.*');
            }
            descriptionLines.push('');

            // Inherited Permissions
            descriptionLines.push('**Inherited Role Permissions**:');
            if (rolePerms.length > 0) {
                descriptionLines.push(...rolePerms);
            } else {
                descriptionLines.push('*No inherited permissions from roles.*');
            }

            embed.setDescription(descriptionLines.join('\n'));
            return message.reply({ embeds: [embed] });
        }
    }
};
