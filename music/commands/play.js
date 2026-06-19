const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Plays a song from YouTube or searches for it',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        const query = args.join(' ');
        if (!query) return message.reply("❌ Please provide a song name or YouTube link!");

        const loadingMsg = await message.reply(`🔍 Searching...`);

        // Check for existing collector BEFORE playing, in case metadata gets overwritten
        const existingQueue = player.nodes.get(message.guild.id);
        const oldCollector = existingQueue?.metadata?.lastAddCollector;

        try {
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: message.channel, controllerMsg: null, guild: message.guild },
                    selfDeaf: config.selfDeaf !== undefined ? config.selfDeaf : true,
                    volume: config.defaultVolume !== undefined ? config.defaultVolume : 80,
                    leaveOnEmpty: config.leaveOnEmpty !== undefined ? config.leaveOnEmpty : true,
                    leaveOnEmptyCooldown: config.leaveOnEmptyCooldown !== undefined ? config.leaveOnEmptyCooldown : 30000,
                    leaveOnEnd: config.leaveOnEnd !== undefined ? config.leaveOnEnd : false,
                    skipOnNoStream: true,
                }
            });
            
            const queue = player.nodes.get(message.guild.id);
            
            // Stop previous collector if exists so only one active "Add" embed exists
            if (oldCollector) {
                oldCollector.stop('new_song');
            }

            const embed = new EmbedBuilder()
                .setColor(config.embed?.color || '#2b2d31')
                .setAuthor({ name: 'Added to Queue', iconURL: message.author.displayAvatarURL() })
                .setDescription(`**[${track.title}](${track.url})**`)
                .setThumbnail(track.thumbnail);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('add_remove').setLabel('🗑️ Remove').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('add_top').setLabel('🔼 Push to Top').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('add_keep').setLabel('✅ Keep').setStyle(ButtonStyle.Secondary)
            );

            const addedMsg = await loadingMsg.edit({ content: '', embeds: [embed], components: [row] });

            const collector = addedMsg.createMessageComponentCollector({ time: 120000 });
            queue.metadata.lastAddCollector = collector;

            collector.on('collect', async (i) => {
                // Ensure only the requester can use these buttons
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: 'Only the requester can use these buttons.', flags: 64 });
                }

                if (i.customId === 'add_remove') {
                    queue.removeTrack(track);
                    embed.setAuthor({ name: 'Removed from Queue', iconURL: message.author.displayAvatarURL() });
                    await i.update({ embeds: [embed], components: [] });
                    collector.stop('user_action');
                } else if (i.customId === 'add_top') {
                    // Find the track in the queue array
                    const trackIdx = queue.tracks.toArray().findIndex(t => t.id === track.id);
                    if (trackIdx !== -1) {
                        const removedTrack = queue.node.remove(trackIdx);
                        if (removedTrack) {
                            queue.node.insert(removedTrack, 0); // Insert at the front (play next)
                        }
                    }
                    embed.setAuthor({ name: 'Pushed to Top', iconURL: message.author.displayAvatarURL() });
                    await i.update({ embeds: [embed], components: [] });
                    collector.stop('user_action');
                } else if (i.customId === 'add_keep') {
                    embed.setAuthor({ name: 'Kept in Queue', iconURL: message.author.displayAvatarURL() });
                    await i.update({ embeds: [embed], components: [] });
                    collector.stop('user_action');
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time' || reason === 'new_song') {
                    // Remove buttons but keep embed
                    addedMsg.edit({ components: [] }).catch(() => {});
                }
            });

        } catch (e) {
            console.error(e);
            loadingMsg.edit(`❌ Error: ${e.message}`).catch(() => {});
        }
    }
};
