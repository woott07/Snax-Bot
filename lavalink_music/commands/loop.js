const { checkVoice } = require('../../utils/voiceCheck');

module.exports = {
    name: 'loop',
    description: 'Loop the current song, or a specific song from the queue by number/name',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return message.reply('❌ No music playing!');

        const check = checkVoice(message, config);
        if (!check.valid) return message.reply(check.message);

        const input = args.join(' ').trim();

        // ─── $loop (no args) — toggle loop on current song ──────────────────────
        if (!input) {
            if (kPlayer.loop === 'track') {
                kPlayer.setLoop('none');
                return message.reply('➡️ Track loop **disabled**.');
            } else {
                kPlayer.setLoop('track');
                return message.reply(`🔂 Now looping: **${kPlayer.queue.current?.title || 'current song'}**`);
            }
        }

        // ─── $loop <number or name> — skip to that song and loop it ─────────────
        const upcoming = Array.from(kPlayer.queue);
        if (upcoming.length === 0) {
            return message.reply('❌ The queue is empty. Use `$loop` with no args to loop the current song.');
        }

        let targetIndex = -1;
        const num = parseInt(input, 10);

        if (!isNaN(num)) {
            // Number-based (1-indexed from $queue output)
            targetIndex = num - 1;
            if (targetIndex < 0 || targetIndex >= upcoming.length) {
                return message.reply(`❌ Invalid number. Queue has **${upcoming.length}** song(s). Use \`$queue\` to see the list.`);
            }
        } else {
            // Name-based search
            targetIndex = upcoming.findIndex(t => t.title.toLowerCase().includes(input.toLowerCase()));
            if (targetIndex === -1) {
                return message.reply(`❌ No song matching **"${input}"** found in queue. Use \`$queue\` to see the numbered list.`);
            }
        }

        const targetTrack = upcoming[targetIndex];

        // Move target track to front of queue, keep rest in order
        upcoming.splice(targetIndex, 1);
        kPlayer.queue.clear();

        // Re-add target first, then the rest
        for (const t of [targetTrack, ...upcoming]) {
            kPlayer.queue.push(t);
        }

        // Skip current song so the target starts playing
        await kPlayer.skip();
        kPlayer.setLoop('track');

        return message.reply(`🔂 Skipping to and looping: **${targetTrack.title}**`);
    }
};
