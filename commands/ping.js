module.exports = {
    name: 'ping',
    description: 'Replies with pong!',
    async execute(message, args, client, player, config) {
        return message.reply('pong! 🏓');
    }
};
