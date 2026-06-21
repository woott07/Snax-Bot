module.exports = {
    name: 'shuffle',
    description: 'Shuffle the current queue',
    execute: async (message, args, client, player) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) {
            return message.reply('❌ Nothing is playing right now.');
        }

        if (kPlayer.queue.length < 2) {
            return message.reply('❌ Add at least **2** songs to the queue before shuffling.');
        }

        kPlayer.queue.shuffle();
        return message.reply('🔀 Queue shuffled!');
    }
};
