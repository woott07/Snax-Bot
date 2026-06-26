const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { setGuildSetting } = require('../../utils/settingsManager');

module.exports = {
    name: 'setup',
    aliases: ['setups'],
    description: 'Sets the log channel for music playing and bot events',
    async execute(message, args, client, player, config) {
        // Permissions check: Server Owner, Bot Owner, or Administrator/Manage Guild
        const isServerOwner = message.guild.ownerId === message.author.id;
        const isBotOwner = config.ownerId && message.author.id === config.ownerId;
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator) || 
                        message.member.permissions.has(PermissionFlagsBits.ManageGuild);

        if (!isServerOwner && !isBotOwner && !isAdmin) {
            return message.reply('❌ You do not have permission to run this command. You must be the Server Owner, Bot Owner, or have administrator permissions.');
        }

        const pinkColor = config.embedColor || config.embed?.color || '#FF8DA1';

        // Check if channel was passed as an argument
        let targetChannel = null;
        if (args.length > 0) {
            const rawArg = args[0];
            // Match mention format <#ID> or just numeric ID
            const channelIdMatch = rawArg.match(/^<#(\d+)>$/) || rawArg.match(/^(\d+)$/);
            if (channelIdMatch) {
                const channelId = channelIdMatch[1];
                targetChannel = message.guild.channels.cache.get(channelId);
            } else {
                // Try searching by name
                targetChannel = message.guild.channels.cache.find(c => c.name.toLowerCase() === rawArg.toLowerCase() && c.type === ChannelType.GuildText);
            }

            if (targetChannel && targetChannel.type === ChannelType.GuildText) {
                setGuildSetting(message.guild.id, 'logChannelId', targetChannel.id);
                const embed = new EmbedBuilder()
                    .setColor(pinkColor)
                    .setTitle('⚙️ Log Channel Configured')
                    .setDescription(`Successfully set the log channel to ${targetChannel}! All music activities and logs will be posted there.`)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            } else {
                return message.reply('❌ Invalid channel. Please mention a valid text channel (e.g. `$setup #logs`) or use the interactive menu by typing `$setup` without arguments.');
            }
        }

        // Send interactive select menu
        const embed = new EmbedBuilder()
            .setColor(pinkColor)
            .setTitle('⚙️ Setup Guild Log Channel')
            .setDescription('Please select a text channel from the menu below to set it as the bot\'s log channel. This channel will log what is playing and when.')
            .setFooter({ text: 'Snax Bot Settings' });

        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('set_log_channel_menu')
            .setPlaceholder('Select a text channel...')
            .setChannelTypes([ChannelType.GuildText]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // Collect component interaction
        const filter = i => i.customId === 'set_log_channel_menu' && i.user.id === message.author.id;
        const collector = response.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            const selectedChannelId = i.values[0];
            const channel = message.guild.channels.cache.get(selectedChannelId);

            if (!channel) {
                return i.reply({ content: '❌ Channel not found.', ephemeral: true });
            }

            setGuildSetting(message.guild.id, 'logChannelId', selectedChannelId);

            const successEmbed = new EmbedBuilder()
                .setColor(pinkColor)
                .setTitle('✅ Setup Complete')
                .setDescription(`Successfully set the log channel to ${channel}! All music activities and logs will be posted there.`)
                .setTimestamp();

            await i.update({
                embeds: [successEmbed],
                components: []
            });
            collector.stop('done');
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                response.edit({
                    content: '⏱️ Setup timed out. Please run the command again.',
                    embeds: [],
                    components: []
                }).catch(() => {});
            }
        });
    }
};
