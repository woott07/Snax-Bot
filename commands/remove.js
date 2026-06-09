module.exports = {
    name: 'remove',
    description: 'Remove a specific song from the queue by name',
    async execute(message, args, client, player, config) {
        const queue = player.nodes.get(message.guild.id);
        
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ No music is currently playing.');
        }

        const query = args.join(' ').toLowerCase();
        if (!query) {
            return message.reply('❌ Please provide the name of the song you want to remove.');
        }

        // Get the current queue array
        const tracks = queue.tracks.toArray();

        if (tracks.length === 0) {
            return message.reply('❌ The queue is empty.');
        }

        // Search for a track that matches the query
        const trackIndex = tracks.findIndex(t => t.title.toLowerCase().includes(query));

        if (trackIndex === -1) {
            return message.reply(`❌ Could not find a song matching **"${query}"** in the queue.`);
        }

        // We found a match! Get the track
        const trackToRemove = tracks[trackIndex];

        // Remove it using its queue index
        queue.node.remove(trackIndex);

        message.reply(`🗑️ Removed **${trackToRemove.title}**`);
    }
};
