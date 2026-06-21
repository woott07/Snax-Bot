const { EmbedBuilder } = require('discord.js');
const { formatMs, buildBar } = require('../embeds');

module.exports = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Show what is currently playing',
    execute: async (message, args, client, player, config) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) {
            return message.reply('❌ Nothing is playing right now.');
        }

        const track = kPlayer.queue.current;
        if (!track) return message.reply('❌ Nothing is playing right now.');

        const position = kPlayer.position || 0;
        const duration = track.length || 0;
        const color = config.embed?.color || '#5865F2';

        const bar = buildBar(position, duration);
        const timeStr = `\`${formatMs(position)}\` ${bar} \`${formatMs(duration)}\``;

        const requester = track.requester?.username
            ? `-# Requested by ${track.requester.username}`
            : '';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(
                `### [${track.title}](${track.uri})\n${requester}\n\n${timeStr}`
            );

        if (track.thumbnail?.startsWith('http')) {
            embed.setThumbnail(track.thumbnail);
        }

        return message.reply({ embeds: [embed] });
    }
};
