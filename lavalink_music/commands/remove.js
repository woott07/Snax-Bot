module.exports = {
    name: 'remove',
    description: 'Remove a song from the queue by number or name',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) {
            return message.reply('❌ No music is currently playing.');
        }

        const input = args.join(' ').trim();
        if (!input) {
            return message.reply('❌ Please provide a song number or name.\nExample: `$remove 2` or `$remove song name`');
        }

        const tracks = Array.from(kPlayer.queue);
        if (tracks.length === 0) {
            return message.reply('❌ The queue is empty. Nothing to remove.');
        }

        let trackIndex = -1;
        const num = parseInt(input, 10);

        if (!isNaN(num)) {
            trackIndex = num - 1;
            if (trackIndex < 0 || trackIndex >= tracks.length) {
                return message.reply(`❌ Invalid number. Queue has **${tracks.length}** song(s). Use \`$queue\` to see the list.`);
            }
        } else {
            trackIndex = tracks.findIndex(t => t.title.toLowerCase().includes(input.toLowerCase()));
            if (trackIndex === -1) {
                return message.reply(`❌ No song matching **"${input}"** found. Use \`$queue\` to see the numbered list.`);
            }
        }

        const trackToRemove = tracks[trackIndex];
        kPlayer.queue.remove(trackIndex);
        return message.reply(`🗑️ Removed **#${trackIndex + 1} — ${trackToRemove.title}** from the queue.`);
    }
};
