const { EmbedBuilder } = require('discord.js');
const reply = require('../../utils/reply');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Shows the current queue',
    async execute(message, args, client, player, config) {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        const current = kPlayer.queue.current;
        const upcoming = Array.from(kPlayer.queue);
        const color = config.embed?.color || '#5865F2';
        const maxDisplay = config.maxQueueDisplay || 10;

        let queueLines;
        if (upcoming.length === 0) {
            queueLines = '-# Nothing else queued — use `$play` to add more.';
        } else {
            queueLines = upcoming
                .slice(0, maxDisplay)
                .map((t, i) => `\`${String(i + 1).padStart(2, ' ')}.\` ${t.title}`)
                .join('\n');
            if (upcoming.length > maxDisplay) {
                queueLines += `\n-# + ${upcoming.length - maxDisplay} more`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(
                `▶  **Now Playing**\n### ${current?.title || 'Unknown'}\n\n` +
                `**Up Next — ${upcoming.length} song${upcoming.length !== 1 ? 's' : ''}**\n${queueLines}`
            )
            .setFooter({ text: '$remove <number> · $skip · $stop · $shuffle' });

        if (current?.thumbnail?.startsWith('http')) {
            embed.setThumbnail(current.thumbnail);
        }

        await message.reply({ embeds: [embed] });
    }
};
