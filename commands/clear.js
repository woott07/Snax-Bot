module.exports = {
    name: 'clear',
    description: 'Clear the current queue',
    execute: async (message, args, client, player) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) {
            return message.reply('❌ No music is currently playing.');
        }
        if (kPlayer.queue.length === 0) {
            return message.reply('❌ The queue is already empty.');
        }
        kPlayer.queue.clear();
        message.reply('🗑️ The queue has been cleared.');
    }
};
