module.exports = {
    name: 'clear',
    description: 'Clear the current queue',
    execute: async (message, args, client, player) => {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ No music is currently playing.');
        }

        if (queue.tracks.size === 0) {
            return message.reply('❌ The queue is already empty.');
        }

        queue.tracks.clear();
        message.reply('🗑️ The queue has been cleared.');
    }
};
