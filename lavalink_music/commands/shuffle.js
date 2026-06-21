const reply = require('../../utils/reply');

module.exports = {
    name: 'shuffle',
    description: 'Shuffle the current queue',
    execute: async (message, args, client, player) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        if (kPlayer.queue.length < 2) {
            return reply.err(message, 'Add at least **2 songs** to the queue before shuffling.');
        }

        kPlayer.queue.shuffle();
        return reply.ok(message, `🔀  Queue shuffled — ${kPlayer.queue.length} songs reordered.`, { ephemeral: true });
    }
};
