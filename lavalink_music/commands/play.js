const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song or playlist',
    async execute(message, args, client, player, config) {
        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const voiceChannel = check.channel;
        const rawQuery = args.join(' ');
        if (!rawQuery) return message.reply('🎵 What would you like to play? Provide a song name or link.');

        const loadingMsg = await message.reply('🔍 Searching...');

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
                return loadingMsg.edit(`❌ Nothing found for **"${rawQuery}"**. Try a different search or paste a direct link.`);
            }

            if (searchResult.type === 'PLAYLIST') {
                for (const track of searchResult.tracks) {
                    kPlayer.queue.add(track);
                }
                await loadingMsg.edit(`📀 Added **${searchResult.tracks.length}** songs from **${searchResult.playlistName || 'playlist'}** to the queue.`);
            } else {
                const track = searchResult.tracks[0];
                kPlayer.queue.add(track);
                await loadingMsg.edit(`✅ Added to queue: **${track.title}**`);
            }

            if (!kPlayer.playing && !kPlayer.paused) {
                await kPlayer.play();
            }

        } catch (e) {
            console.error('[Play Error]', e);
            loadingMsg.edit('⚠️ Something went wrong while trying to play that. Please try again.').catch(() => {});
        }
    }
};
