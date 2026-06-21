const logger = require('../../utils/logger');

module.exports = {
    name: 'playerEmpty',
    async execute(player, client, kazagumo, config) {
        // Check if autoplay is enabled for this player
        const autoplayEnabled = player.data.get('autoplay') || false;
        if (!autoplayEnabled) return;

        const lastTrack = player.data.get('lastTrack');
        if (!lastTrack) return;

        logger.info(`[Autoplay] Queue empty — searching for related song to: "${lastTrack.title}"`);

        const channelId = player.data.get('channelId');
        const channel = channelId ? client.channels.cache.get(channelId) : null;

        try {
            // Build a smart search query based on the last track:
            // Strip common suffixes like "(Official Video)", "[Lyrics]" etc. for cleaner results
            const cleanTitle = lastTrack.title
                .replace(/\(.*?\)|\[.*?\]/g, '')   // remove brackets
                .replace(/official|video|lyrics|audio|hd|hq|mv/gi, '')
                .trim();

            const author = lastTrack.author || '';

            // Strategy: search for "artist mix" or "songs like <title>" to get varied related tracks
            const queries = [
                `${author} best songs`,
                `${cleanTitle} similar songs`,
                `${cleanTitle} ${author}`,
            ].filter(Boolean);

            // Pick a random query from the strategies to vary the results
            const query = queries[Math.floor(Math.random() * queries.length)];
            logger.info(`[Autoplay] Searching: "${query}"`);

            const result = await kazagumo.search(query, { requester: client.user });

            if (!result || !result.tracks.length) {
                logger.warn('[Autoplay] No related songs found.');
                if (channel) channel.send('🎵 Queue ended. No related songs found. Feel free to add more with `$play`!').catch(() => {});
                return;
            }

            // Pick a random track from the top 5 results so it doesn't always play the same song
            const topTracks = result.tracks.slice(0, 5);
            const picked = topTracks[Math.floor(Math.random() * topTracks.length)];

            // Skip if it's the same as the last track
            if (picked.title === lastTrack.title) {
                const alternate = topTracks.find(t => t.title !== lastTrack.title);
                if (!alternate) {
                    if (channel) channel.send('🎵 Queue ended. Could not find a new related song.').catch(() => {});
                    return;
                }
            }

            player.queue.add(picked);
            logger.info(`[Autoplay] Queued related track: "${picked.title}"`);

            if (channel) {
                channel.send(`🤖 **Up next via Autoplay:** ${picked.title}`).catch(() => {});
            }

            // Start playing if not already
            if (!player.playing && !player.paused) {
                await player.play();
            }

        } catch (err) {
            logger.error(`[Autoplay] Error fetching related track: ${err.message}`);
            if (channel) channel.send('⚠️ Autoplay ran into an issue. Add songs manually with `$play`.').catch(() => {});
        }
    }
};
