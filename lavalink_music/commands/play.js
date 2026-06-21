const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song or playlist',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        const voiceChannel = check.channel;
        const rawQuery = args.join(' ');
        if (!rawQuery) return reply.err(message, 'Provide a song name or link.\n-# Example: `$play Blinding Lights`');

        const loadingMsg = await reply.neutral(message, '🔍  Searching...');

        try {
            let kPlayer = player.players.get(message.guild.id);
            if (!kPlayer) {
                kPlayer = await player.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: voiceChannel.id,
                    deaf: config.selfDeaf !== undefined ? config.selfDeaf : true
                });
            }

            kPlayer.data.set('channelId', message.channel.id);

            const searchResult = await player.search(rawQuery, { requester: message.author });

            if (!searchResult.tracks.length) {
                return loadingMsg?.edit({
                    embeds: [{ color: 0xED4245, description: `Nothing found for **"${rawQuery}"**.\n-# Try a different name or paste a direct link.` }]
                });
            }

            if (searchResult.type === 'PLAYLIST') {
                for (const track of searchResult.tracks) kPlayer.queue.add(track);
                loadingMsg?.edit({
                    embeds: [{ color: 0x57F287, description: `📀  Added **${searchResult.tracks.length} songs** from **${searchResult.playlistName || 'playlist'}** to the queue.` }]
                });
            } else {
                const track = searchResult.tracks[0];
                kPlayer.queue.add(track);
                loadingMsg?.edit({
                    embeds: [{ color: 0x57F287, description: `✅  Added to queue\n### ${track.title}` }]
                });
            }

            if (!kPlayer.playing && !kPlayer.paused) await kPlayer.play();

        } catch (e) {
            console.error('[Play Error]', e);
            loadingMsg?.edit({
                embeds: [{ color: 0xED4245, description: '⚠️  Something went wrong. Please try again.' }]
            }).catch(() => {});
        }
    }
};
