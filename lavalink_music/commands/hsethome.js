const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const { setGlobalSetting, getGlobalSetting } = require('../../utils/settingsManager');

module.exports = {
    name: 'hsethome',
    aliases: ['sethome', 'sethomeserver'],
    description: 'Sets the global log channel in the home server',
    async execute(message, args, client, player, config) {
        // Permissions check: ONLY Bot Owner
        const isBotOwner = config.ownerId && message.author.id === config.ownerId;
        if (!isBotOwner) {
            return message.reply('❌ This command can only be executed by the bot owner.');
        }

        const pinkColor = config.embedColor || config.embed?.color || '#FF8DA1';

        // Retrieve Home Server ID from .env or settings
        const homeServerId = process.env.HOME_SERVER_ID || getGlobalSetting('homeServerId');
        if (!homeServerId) {
            return message.reply('❌ HOME_SERVER_ID is not configured in your `.env` file. Please add it first.');
        }

        const homeGuild = client.guilds.cache.get(homeServerId);
        if (!homeGuild) {
            return message.reply(`❌ Could not find the home server (\`${homeServerId}\`) in the bot's cache. Make sure the bot is in that server!`);
        }

        // Check if channel was passed as an argument
        let targetChannel = null;
        if (args.length > 0) {
            const rawArg = args[0];
            const channelIdMatch = rawArg.match(/^<#(\d+)>$/) || rawArg.match(/^(\d+)$/);
            if (channelIdMatch) {
                const channelId = channelIdMatch[1];
                targetChannel = homeGuild.channels.cache.get(channelId);
            } else {
                targetChannel = homeGuild.channels.cache.find(c => c.name.toLowerCase() === rawArg.toLowerCase() && c.type === ChannelType.GuildText);
            }

            if (targetChannel && targetChannel.type === ChannelType.GuildText) {
                setGlobalSetting('homeLogChannelId', targetChannel.id);
                const embed = new EmbedBuilder()
                    .setColor(pinkColor)
                    .setTitle('🏠 Global Log Channel Configured')
                    .setDescription(`Successfully set the global log channel on **${homeGuild.name}** to ${targetChannel}!`)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            } else {
                return message.reply(`❌ Invalid channel. Please mention a valid text channel in the home server (e.g. \`$hsethome #channel-name\`).`);
            }
        }

        // Interactive select menu (only works if run in the home server)
        if (message.guild.id !== homeServerId) {
            return message.reply(`❌ Please run this command in the home server (**${homeGuild.name}**) to use the interactive menu, or provide the channel mention/ID as an argument (e.g. \`$hsethome #channel\`).`);
        }

        const embed = new EmbedBuilder()
            .setColor(pinkColor)
            .setTitle('🏠 Setup Global Log Channel')
            .setDescription(`Please select a text channel in this home server to set it as the global log channel (for crashes, joins/leaves, etc.).`)
            .setFooter({ text: 'Snax Bot Settings' });

        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('set_home_log_channel_menu')
            .setPlaceholder('Select a text channel...')
            .setChannelTypes([ChannelType.GuildText]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // Collect component interaction
        const filter = i => i.customId === 'set_home_log_channel_menu' && i.user.id === message.author.id;
        const collector = response.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            const selectedChannelId = i.values[0];
            const channel = homeGuild.channels.cache.get(selectedChannelId);

            if (!channel) {
                return i.reply({ content: '❌ Channel not found.', ephemeral: true });
            }

            setGlobalSetting('homeLogChannelId', selectedChannelId);

            const successEmbed = new EmbedBuilder()
                .setColor(pinkColor)
                .setTitle('✅ Setup Complete')
                .setDescription(`Successfully set the global log channel to ${channel}!`)
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
