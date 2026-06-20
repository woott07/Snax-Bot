const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkVoice } = require('../../utils/voiceCheck');
const { resolveQuery } = require('../searchPipeline');
const logger = require('../../utils/logger');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Plays a song from YouTube or searches for it using YouTube Data API',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        const rawQuery = args.join(' ');
        if (!rawQuery) return message.reply("❌ Please provide a song name or YouTube link!");

        const loadingMsg = await message.reply(`🔍 Searching...`);

        // Check for existing collector BEFORE playing, in case metadata gets overwritten
        const existingQueue = player.nodes.get(message.guild.id);
        const oldCollector = existingQueue?.metadata?.lastAddCollector;

        let resolvedUrl = '';
        let trackMetadata = null;

        try {
            // ── 1. Search Pipeline (Data API v3) ────────────────────────────────
            logger.info(`\n========== DEBUG: PLAY COMMAND TRIGGERED ==========`);
            logger.info(`[DEBUG] User query: "${rawQuery}"`);
            
            // resolveQuery throws errors for No Results or Quota Exceeded
            const resolved = await resolveQuery(rawQuery);
            resolvedUrl = resolved.query;

            logger.info(`[DEBUG] Detected Query Type: ${resolved.isDirectUrl ? (resolved.source === 'direct-url' ? 'Direct URL' : 'Text Search') : 'Unknown'}`);
            
            if (resolved.source === 'youtube-data-api') {
                logger.info(`[DEBUG] YouTube API response parsed successfully.`);
                logger.info(`[DEBUG] Selected video ID: ${resolved.videoId}`);
                logger.info(`[DEBUG] Generated YouTube URL: ${resolved.query}`);
            }

            // ── 2. Play the resolved URL ────────────────────────────────────────
            logger.info(`[DEBUG] Passing URL to discord-player: ${resolvedUrl}`);
            
            const searchResult = await player.search(resolvedUrl, {
                requestedBy: message.author,
            });

            if (!searchResult || !searchResult.tracks.length) {
                throw new Error('NO_RESULTS');
            }

            trackMetadata = searchResult.tracks[0];

            let queue = player.nodes.get(message.guild.id);
            if (!queue) {
                queue = player.nodes.create(message.guild, {
                    metadata: { channel: message.channel, controllerMsg: null, guild: message.guild },
                    selfDeaf: config.selfDeaf !== undefined ? config.selfDeaf : true,
                    volume: config.defaultVolume !== undefined ? config.defaultVolume : 80,
                    leaveOnEmpty: config.leaveOnEmpty !== undefined ? config.leaveOnEmpty : true,
                    leaveOnEmptyCooldown: config.leaveOnEmptyCooldown !== undefined ? config.leaveOnEmptyCooldown : 30000,
                    leaveOnEnd: config.leaveOnEnd !== undefined ? config.leaveOnEnd : false,
                    skipOnNoStream: true,
                });
            }

            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }

            queue.addTrack(trackMetadata);

            if (!queue.node.isPlaying()) {
                await queue.node.play();
            }

            logger.info(`[DEBUG] Track count returned: ${searchResult.tracks.length}`);
            logger.info(`[DEBUG] Selected Extractor: ${searchResult.extractor?.identifier || 'Unknown'}`);
            logger.info(`[DEBUG] Stream status: Extraction initialized via YTDLPExtractor (yt-dlp)`);
            logger.info(`====================================================\n`);
            // Stop previous collector if exists so only one active "Add" embed exists
            if (oldCollector) {
                oldCollector.stop('new_song');
            }

            // ── 3. Build the "Added to Queue" embed ──────────────────────────────
            const sourceLabel = resolved.source === 'youtube-data-api'
                ? ` · Found via YouTube Data API v3`
                : '';

            const embed = new EmbedBuilder()
                .setColor(config.embed?.color || '#2b2d31')
                .setAuthor({ name: 'Added to Queue', iconURL: message.author.displayAvatarURL() })
                .setDescription(`**[${trackMetadata.title}](${trackMetadata.url})**`)
                .setFooter({ text: `Duration: ${trackMetadata.duration}${sourceLabel}` })
                .setThumbnail(trackMetadata.thumbnail);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('add_remove').setLabel('🗑️ Remove').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('add_top').setLabel('🔼 Push to Top').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('add_keep').setLabel('✅ Keep').setStyle(ButtonStyle.Secondary)
            );

            const addedMsg = await loadingMsg.edit({ content: '', embeds: [embed], components: [row] });

            const collector = addedMsg.createMessageComponentCollector({ time: 120000 });
            queue.metadata.lastAddCollector = collector;

            collector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: 'Only the requester can use these buttons.', flags: 64 });
                }

                if (i.customId === 'add_remove') {
                    queue.removeTrack(trackMetadata);
                    embed.setAuthor({ name: 'Removed from Queue', iconURL: message.author.displayAvatarURL() });
                    await i.update({ embeds: [embed], components: [] });
                    collector.stop('user_action');
                } else if (i.customId === 'add_top') {
                    const trackIdx = queue.tracks.toArray().findIndex(t => t.id === trackMetadata.id);
                    if (trackIdx !== -1) {
                        const removedTrack = queue.node.remove(trackIdx);
                        if (removedTrack) {
                            queue.node.insert(removedTrack, 0); // Insert at the front
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
                    addedMsg.edit({ components: [] }).catch(() => {});
                }
            });

        } catch (e) {
            const errorMsg = e.message || String(e);
            logger.error(`[Play] Error executing play command for "${rawQuery}": ${errorMsg}`);
            logger.info(`[DEBUG] Stream status: Failed`);
            logger.info(`====================================================\n`);

            let userMessage = `❌ An unexpected error occurred: ${errorMsg}`;

            // Handle Specific Errors
            if (errorMsg.includes('API_QUOTA_EXCEEDED')) {
                userMessage = '⚠️ **YouTube API Quota Exceeded!** The bot has reached its 100 text-searches per day limit. Please use direct YouTube URLs until the quota resets tomorrow.';
            } else if (errorMsg.includes('NO_RESULTS')) {
                userMessage = `❌ **No results found** for: \`${rawQuery}\`. Please try a different search term or paste a direct YouTube URL.`;
            } else if (errorMsg.includes('YOUTUBE_API_KEY is missing')) {
                userMessage = '⚠️ The bot is not configured correctly. `YOUTUBE_API_KEY` is missing from the environment variables.';
            } else if (errorMsg.includes('No results found for') || errorMsg.includes('Extractor: N/A')) {
                // This happens when the search pipeline resolved the URL, but the Extractor failed to fetch the metadata (e.g. invalid URL or blocked Auth Token)
                userMessage = `❌ **Extraction Failed:** The extractor could not process this YouTube URL. If this persists on all URLs, the OAuth token may be flagged.`;
            } else if (errorMsg.includes('Sign in to confirm')) {
                userMessage = '⚠️ **Authentication Error:** YouTube anti-bot protection triggered. The current OAuth token may be flagged.';
            } else if (errorMsg.includes('403')) {
                userMessage = '⚠️ **Stream Blocked (403):** The video may be region-restricted or age-gated.';
            }

            loadingMsg.edit(userMessage).catch(() => {});
        }
    }
};
