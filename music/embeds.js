const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

/**
 * Creates the standard media player interface embed
 */
function createQueueEmbed(queue, config, isExpanded = false) {
    const currentTrack = queue.currentTrack;

    // Return null if there is no track playing
    if (!currentTrack) return null;

    const upcoming = queue.tracks.toArray();
    const limit = isExpanded ? (config.maxQueueDisplay || 10) : 3;

    let queueString = '*No upcoming tracks in queue.*';
    if (upcoming.length > 0) {
        queueString = upcoming.slice(0, limit).map((t, i) => `**${i + 1}.** ${t.title}`).join('\n');
        if (upcoming.length > limit) {
            queueString += `\n\n*...and ${upcoming.length - limit} more tracks*`;
        }
    }

    let statusText = queue.node.isPaused() ? 'Paused' : 'Playing';
    if (queue.repeatMode === QueueRepeatMode.TRACK) statusText += ' | 🔂 Track Loop';
    if (queue.repeatMode === QueueRepeatMode.QUEUE) statusText += ' | 🔁 Queue Loop';
    if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) statusText += ' | 🤖 Autoplay';

    const color = config.embedColor || config.embed?.color || '#2b2d31';
    const showThumbnail = config.embed?.showThumbnail !== false;
    const showRequester = config.embed?.showRequester !== false;

    const requesterText = showRequester ? `\n*Requested by: ${currentTrack.requestedBy?.username || 'Unknown'}*` : '';

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🎵 Dynamic Audio Player')
        .addFields(
            { name: '💿 Now Playing', value: `**[${currentTrack.title}](${currentTrack.url})**${requesterText}` },
            { name: `📋 Up Next (Total: ${upcoming.length})`, value: queueString }
        )
        .setFooter({ text: `Playback Status: ${statusText}` });

    if (showThumbnail && currentTrack.thumbnail && currentTrack.thumbnail.startsWith('http')) {
        embed.setThumbnail(currentTrack.thumbnail);
    }

    return embed;
}

/**
 * Creates the action button row for the controller embed
 */
function createActionRow(isExpanded = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_back').setLabel('⏮️ Back').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_pause').setLabel('⏯️ Pause').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('music_skip').setLabel('⏭️ Skip').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_stop').setLabel('🛑 Stop').setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(isExpanded ? 'music_collapse' : 'music_expand')
            .setLabel(isExpanded ? '🔼 Collapse' : '🔽 Expand')
            .setStyle(ButtonStyle.Success)
    );
}

module.exports = { createQueueEmbed, createActionRow };
