const { checkVoice } = require('../../utils/voiceCheck');
const reply = require('../../utils/reply');

module.exports = {
    name: 'loop',
    description: 'Loop the current song, or a specific song from the queue by number/name',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const check = checkVoice(message, config);
        if (!check.valid) return reply.err(message, check.message);

        const input = args.join(' ').trim();

        // ─── $loop (no args) — toggle loop on current song ──────────────────────
        if (!input) {
            if (kPlayer.loop === 'track') {
                kPlayer.setLoop('none');
                return reply.neutral(message, '➡️  Track loop **disabled**.', { ephemeral: true });
            } else {
                kPlayer.setLoop('track');
                return reply.ok(message, `🔂  Looping: **${kPlayer.queue.current?.title || 'current song'}**`, { ephemeral: true });
            }
        }

        // ─── $loop <number or name> — skip to that song and loop it ─────────────
        const upcoming = Array.from(kPlayer.queue);
        if (upcoming.length === 0) {
            return reply.err(message, 'The queue is empty.\n-# Use `$loop` with no args to loop the current song.');
        }

        let targetIndex = -1;
        const num = parseInt(input, 10);

        if (!isNaN(num)) {
            targetIndex = num - 1;
            if (targetIndex < 0 || targetIndex >= upcoming.length) {
                return reply.err(message, `Invalid number. Queue has **${upcoming.length}** song(s).\n-# Use \`$queue\` to see the list.`);
            }
        } else {
            targetIndex = upcoming.findIndex(t => t.title.toLowerCase().includes(input.toLowerCase()));
            if (targetIndex === -1) {
                return reply.err(message, `No song matching **"${input}"** found.\n-# Use \`$queue\` to see the numbered list.`);
            }
        }

        const targetTrack = upcoming[targetIndex];
        upcoming.splice(targetIndex, 1);
        kPlayer.queue.clear();
        for (const t of [targetTrack, ...upcoming]) kPlayer.queue.push(t);

        await kPlayer.skip();
        kPlayer.setLoop('track');

        return reply.ok(message, `🔂  Skipping to and looping:\n### ${targetTrack.title}`, { ephemeral: true });
    }
};
