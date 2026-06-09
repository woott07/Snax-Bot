module.exports = {
    name: 'hello',
    description: 'Greets the user',
    async execute(message, args, client, player, config) {
        return message.reply(`Hello there, ${message.author.username}! 👋`);
    }
};
