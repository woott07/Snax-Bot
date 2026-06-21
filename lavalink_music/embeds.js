const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Helper: format milliseconds → m:ss
function formatMs(ms) {
    const total = Math.floor((ms || 0) / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper: build a clean progress bar
function buildBar(position, duration, length = 18) {
    if (!duration) return '─'.repeat(length);
    const filled = Math.round((position / duration) * length);
    return '─'.repeat(Math.max(0, filled)) + '●' + '─'.repeat(Math.max(0, length - filled - 1));
}

/**
 * Creates the main player controller embed
 */
function createQueueEmbed(kPlayer, config, isExpanded = false) {
    const track = kPlayer.queue.current;
    if (!track) return null;

    const upcoming = Array.from(kPlayer.queue);
    const limit = isExpanded ? (config.maxQueueDisplay || 10) : 3;
    const color = config.embedColor || config.embed?.color || '#5865F2';
    const showThumbnail = config.embed?.showThumbnail !== false;
    const showRequester = config.embed?.showRequester !== false;

    // Build queue list
    let queueText = '`  nothing queued  `';
    if (upcoming.length > 0) {
        queueText = upcoming
            .slice(0, limit)
            .map((t, i) => `\`${String(i + 1).padStart(2, ' ')}.\` ${t.title}`)
            .join('\n');
        if (upcoming.length > limit) {
            queueText += `\n*+ ${upcoming.length - limit} more*`;
        }
    }

    // Status line
    const statusParts = [];
    if (kPlayer.paused) statusParts.push('⏸ Paused');
    else statusParts.push('▶ Playing');
    if (kPlayer.loop === 'track') statusParts.push('🔂 Track');
    if (kPlayer.loop === 'queue') statusParts.push('🔁 Queue');
    if (kPlayer.data?.get('autoplay')) statusParts.push('🤖 Autoplay');

    const requester = showRequester && track.requester?.username
        ? `\n-# Requested by ${track.requester.username}`
        : '';

    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(
            `### [${track.title}](${track.uri})${requester}`
        )
        .addFields(
            {
                name: `Up next — ${upcoming.length} song${upcoming.length !== 1 ? 's' : ''}`,
                value: queueText
            }
        )
        .setFooter({ text: statusParts.join('  ·  ') });

    if (showThumbnail && track.thumbnail?.startsWith('http')) {
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}

/**
 * Creates the media controller button row
 */
function createActionRow(isExpanded = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji('⏯️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(isExpanded ? 'music_collapse' : 'music_expand')
            .setLabel(isExpanded ? 'Less' : 'More')
            .setEmoji(isExpanded ? '🔼' : '🔽')
            .setStyle(ButtonStyle.Primary)
    );
}

module.exports = { createQueueEmbed, createActionRow, formatMs, buildBar };
