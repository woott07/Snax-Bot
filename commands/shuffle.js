module.exports = {
    name: 'shuffle',
    description: 'Shuffle the current queue',
    execute: async (message, args, client, player) => {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ No music is currently playing.');
        }

        if (queue.tracks.size < 2) {
            return message.reply('❌ Not enough songs in the queue to shuffle.');
        }

        queue.tracks.shuffle();
        message.reply('🔀 Queue has been shuffled!');
    }
};
