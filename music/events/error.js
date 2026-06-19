module.exports = {
    name: 'error',
    isPlayer: true,
    async execute(queue, error, client, player, config) {
        console.error('Player error:', error.message);
        queue.metadata.channel.send(`⚠️ Player error: ${error.message}`).catch(console.error);
    }
};
