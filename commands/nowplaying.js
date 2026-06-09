const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nowplaying',
    description: 'Show what is currently playing',
    execute: async (message, args, client, player) => {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ No music is currently playing.');
        }

        const track = queue.currentTrack;
        const ts = queue.node.getTimestamp();

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${track.title}](${track.url})**\nRequested by: ${track.requestedBy || 'Unknown'}`)
            .addFields(
                { name: 'Progress', value: `${queue.node.createProgressBar()}` },
                { name: 'Time', value: `${ts.current.label} / ${ts.total.label}` }
            );

        if (track.thumbnail) embed.setThumbnail(track.thumbnail);

        message.reply({ embeds: [embed] });
    }
};
