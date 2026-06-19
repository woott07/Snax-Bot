const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ChannelSelectMenuBuilder, 
    ChannelType, 
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    name: 'announce',
    aliases: ['announcement'],
    description: 'Post an interactive server announcement to a specific channel',
    async execute(message, args, client, player, config) {
        const defaultColor = config.embed?.color || '#2b2d31';

        // Step 1: Send channel selection embed
        const initialEmbed = new EmbedBuilder()
            .setColor(defaultColor)
            .setAuthor({ name: 'Announcement Setup', iconURL: client.user.displayAvatarURL() })
            .setDescription('Please select the text channel where the announcement should be posted using the dropdown below.')
            .setFooter({ text: 'Step 1 of 2 • Channel Selection' });

        const selectRow = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('announce_channel')
                .setPlaceholder('Select a text channel...')
                .setChannelTypes([ChannelType.GuildText])
        );

        const setupMessage = await message.reply({ 
            embeds: [initialEmbed], 
            components: [selectRow] 
        });

        const filter = i => i.customId === 'announce_channel' && i.user.id === message.author.id;
        const componentCollector = setupMessage.createMessageComponentCollector({ filter, time: 45000, max: 1 });

        componentCollector.on('collect', async interaction => {
            const targetChannelId = interaction.values[0];
            const targetChannel = message.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return interaction.reply({ 
                    content: '❌ Invalid channel selected or channel not found.', 
                    ephemeral: true 
                });
            }

            // Check if the bot has permission to post in that channel
            const botPermissions = targetChannel.permissionsFor(message.guild.members.me);
            if (!botPermissions.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
                return interaction.reply({ 
                    content: `❌ I do not have permission to send messages or embed links in ${targetChannel}. Please choose another channel.`, 
                    ephemeral: true 
                });
            }

            // Step 2: Show Modal with Subject and Description inputs
            const modal = new ModalBuilder()
                .setCustomId('announce_modal')
                .setTitle('Create Announcement');

            const subjectInput = new TextInputBuilder()
                .setCustomId('announcement_subject')
                .setLabel('Subject / Title')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter the title of your announcement...')
                .setRequired(true)
                .setMaxLength(100);

            const textInput = new TextInputBuilder()
                .setCustomId('announcement_text')
                .setLabel('Announcement Details')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Type your announcement details here...')
                .setRequired(true);

            // In Discord, each text input must be in its own ActionRow
            const firstRow = new ActionRowBuilder().addComponents(subjectInput);
            const secondRow = new ActionRowBuilder().addComponents(textInput);
            
            modal.addComponents(firstRow, secondRow);

            // Show the modal to the user
            await interaction.showModal(modal);

            // Await modal submission
            const submitted = await interaction.awaitModalSubmit({
                filter: i => i.customId === 'announce_modal' && i.user.id === message.author.id,
                time: 180000 // 3 minutes
            }).catch(err => {
                // Timeout or error
                return null;
            });

            if (!submitted) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#808080')
                    .setAuthor({ name: 'Setup Timed Out', iconURL: client.user.displayAvatarURL() })
                    .setDescription('⏳ Announcement setup timed out (no announcement text was received).');

                await setupMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
                return;
            }

            const announcementSubject = submitted.fields.getTextInputValue('announcement_subject');
            const announcementContent = submitted.fields.getTextInputValue('announcement_text');

            // Send announcement to target channel
            const finalEmbed = new EmbedBuilder()
                .setColor(defaultColor)
                .setAuthor({ 
                    name: message.guild.name, 
                    iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL() 
                })
                .setTitle(`📢 ${announcementSubject}`)
                .setDescription(announcementContent)
                .setTimestamp()
                .setFooter({ 
                    text: `Posted by ${message.author.username}`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                });

            try {
                const postedMsg = await targetChannel.send({ embeds: [finalEmbed] });

                // Confirm success to the user in the setup message
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff7f') // Spring Green
                    .setAuthor({ name: 'Announcement Posted', iconURL: client.user.displayAvatarURL() })
                    .setDescription(`✅ Successfully posted the announcement to ${targetChannel}!`)
                    .addFields({ name: 'Jump to Message', value: `[Click here to view](${postedMsg.url})` });

                await setupMessage.edit({ embeds: [successEmbed], components: [] });

                // Acknowledge the modal submit interaction to avoid "interaction failed"
                await submitted.reply({
                    content: `✅ Announcement successfully posted in ${targetChannel}!`,
                    ephemeral: true
                });
            } catch (err) {
                console.error('Error posting announcement:', err);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff3333')
                    .setAuthor({ name: 'Announcement Failed', iconURL: client.user.displayAvatarURL() })
                    .setDescription('❌ Failed to post the announcement. Please check channel permissions.');

                await setupMessage.edit({ embeds: [errorEmbed], components: [] }).catch(() => {});
                
                await submitted.reply({
                    content: '❌ Failed to post the announcement.',
                    ephemeral: true
                }).catch(() => {});
            }
        });

        componentCollector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#808080')
                    .setAuthor({ name: 'Setup Timed Out', iconURL: client.user.displayAvatarURL() })
                    .setDescription('⏳ Announcement setup timed out (no channel selected).');

                await setupMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    }
};
