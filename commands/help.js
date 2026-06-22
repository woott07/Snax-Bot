const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { hasPermission, getGuildPrefix } = require('../utils/permissions');

module.exports = {
    name: 'help',
    description: 'Displays a dynamic interactive help menu',
    async execute(message, args, client, player, config) {
        const prefix = getGuildPrefix(message.guild.id) || config.prefix || '$';

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: 'Snax Bot Help Menu', iconURL: client.user.displayAvatarURL() })
            .setDescription('Please select a category from the dropdown menu below to see the available commands.\n\n*Note: You can only view categories you have permission for.*');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Select a command category...')
            .addOptions([
                {
                    label: 'Default Help',
                    description: 'Music and basic commands',
                    value: 'default_help',
                    emoji: '🎵'
                },
                {
                    label: 'Voice Help',
                    description: 'Mute, deafen, and move commands',
                    value: 'voice_help',
                    emoji: '🎤'
                },
                {
                    label: 'Nickname Help',
                    description: 'Commands to change nicknames',
                    value: 'nick_help',
                    emoji: '✏️'
                },
                {
                    label: 'Chat Help',
                    description: 'Purge messages and timeout users',
                    value: 'chat_help',
                    emoji: '💬'
                },
                {
                    label: 'Manager Help',
                    description: 'Ban, kick, and unban users',
                    value: 'manager_help',
                    emoji: '🔨'
                },
                {
                    label: 'Admin Help',
                    description: 'Permission assignment commands',
                    value: 'admin_help',
                    emoji: '⚙️'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const helpMessage = await message.reply({ embeds: [embed], components: [row] });

        // Create a collector for 2 minutes
        const filter = i => i.customId === 'help_category' && i.user.id === message.author.id;
        const collector = helpMessage.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            const category = i.values[0];
            const updatedEmbed = new EmbedBuilder().setColor('#2b2d31');

            if (category === 'default_help') {
                if (!hasPermission(message, 'play')) {
                    return i.reply({ content: '❌ You do not have permission to view Default commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('🎵 Default Commands').setDescription(`
\`${prefix}play <song>\` - Play a song or YouTube URL
\`${prefix}nowplaying\` - Show current playing track info
\`${prefix}queue\` - Show the current queue interface
\`${prefix}volume <0-100>\` - Check or change bot volume
\`${prefix}pause\` / \`${prefix}resume\` - Pause or resume playback
\`${prefix}skip\` / \`${prefix}prev\` - Skip to next/previous song
\`${prefix}remove <name>\` - Remove a specific song
\`${prefix}clear\` / \`${prefix}shuffle\` - Manage the upcoming queue
\`${prefix}loop <number/name>\` - Loop current song or a specific song
\`${prefix}loopQ\` - Toggle loop for the entire queue
\`${prefix}autoplay\` - Toggle Autoplay mode
\`${prefix}stop\` - Stop playback and clear everything
\`${prefix}join\` / \`${prefix}leave\` - Join or leave voice channel
\`${prefix}ping\` / \`${prefix}hello\` - Basic utilities
`);
            } else if (category === 'voice_help') {
                if (!hasPermission(message, 'mute')) {
                    return i.reply({ content: '❌ You do not have permission to view Voice Management commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('🎤 Voice Management Commands').setDescription(`
\`${prefix}dragreq @user\` - Request to drag a user to your VC
\`${prefix}addme @user\` - Request to join a user's VC
\`${prefix}mute @user\` - Server mute a user in VC
\`${prefix}unmute @user\` - Server unmute a user in VC
\`${prefix}deafen @user\` - Server deafen a user in VC
\`${prefix}undeafen @user\` - Server undeafen a user in VC
`);
            } else if (category === 'nick_help') {
                if (!hasPermission(message, 'setnick')) {
                    return i.reply({ content: '❌ You do not have permission to view Nickname commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('✏️ Nickname Commands').setDescription(`
\`${prefix}setnick <name>\` - Change bot's nickname
\`${prefix}setnick @user <name>\` - Change a user's nickname
\`${prefix}remnick\` - Remove bot's nickname
\`${prefix}remnick @user\` - Remove a user's nickname
`);
            } else if (category === 'chat_help') {
                if (!hasPermission(message, 'purge')) {
                    return i.reply({ content: '❌ You do not have permission to view Chat commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('💬 Chat Management Commands').setDescription(`
\`${prefix}purge <1-100>\` - Delete bulk messages in the channel
\`${prefix}timeout @user <minutes>\` - Time out a user
`);
            } else if (category === 'manager_help') {
                if (!hasPermission(message, 'ban')) {
                    return i.reply({ content: '❌ You do not have permission to view Manager commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('🔨 Manager Commands').setDescription(`
\`${prefix}ban @user\` - Permanently ban a user (with confirmation)
\`${prefix}kick @user\` - Kick a user from the server (with confirmation)
\`${prefix}unban <user_id>\` - Unban a user using their ID
`);
            } else if (category === 'admin_help') {
                if (!hasPermission(message, 'AdminExe')) {
                    return i.reply({ content: '❌ You do not have permission to view Admin commands.', ephemeral: true });
                }
                updatedEmbed.setTitle('⚙️ Admin Permission Commands').setDescription(`
*These commands assign power groups to users or roles.*
 
**Admin Power** (Can assign any power below)
\`${prefix}AdminExe @role/@user\` - Grant Admin power
\`${prefix}remAdminExe @role/@user\` - Revoke Admin power
\`${prefix}fetch @role/@user\` - Fetch permissions assigned to a role or user

**Default/Music Access**
\`${prefix}assign_default @role/@everyone\` - Grant Music access
\`${prefix}default_remove @role/@everyone\` - Revoke Music access

**ManagerExe Power** (Ban, Kick, Unban)
\`${prefix}ManagerExe @role/@user\` - Grant ManagerExe power
\`${prefix}remManagerExe @role/@user\` - Revoke ManagerExe power

**VoiceExe Power** (Mute, Deafen, Drag)
\`${prefix}VoiceExe @role/@user\` - Grant VoiceExe power
\`${prefix}remVoiceExe @role/@user\` - Revoke VoiceExe power

**setNickExe Power** (Nickname Control)
\`${prefix}setNickExe @role/@user\` - Grant setNickExe power
\`${prefix}remNickExe @role/@user\` - Revoke setNickExe power

**ChatExe Power** (Purge, Timeout)
\`${prefix}ChatExe @role/@user\` - Grant ChatExe power
\`${prefix}remChatExe @role/@user\` - Revoke ChatExe power

**Spam Bypass Power** (Anti-Spam Filter Immunity)
\`${prefix}BypassExe @role/@user\` - Grant BypassExe (Extended Spam Limit)
\`${prefix}remBypassExe @role/@user\` - Revoke BypassExe
\`${prefix}SupBypass @role/@user\` - Grant SupBypass (Total Spam Immunity)
\`${prefix}remSupBypass @role/@user\` - Revoke SupBypass

**Announcements**
\`${prefix}announce\` - Post a styled announcement to a selected channel
\`${prefix}announceOwn <message>\` - Global announcement to all servers (Bot Owner Only)

**Utility**
\`${prefix}setprefix <prefix>\` - Change the bot's prefix for this server
\`${prefix}remprefix\` - Remove custom prefix and reset to default
`);
            }

            await i.update({ embeds: [updatedEmbed], components: [row] });
        });

        // Disable the select menu after 2 minutes
        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true)
            );
            helpMessage.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
