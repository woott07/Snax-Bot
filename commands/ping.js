module.exports = {
    name: 'ping',
    description: 'Replies with pong and latency!',
    async execute(message, args, client, player, config) {
        const sent = await message.reply('Pinging... 🏓');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        
        sent.edit(`Pong! 🏓\nMessage Latency: \`${latency}ms\`\nAPI Latency: \`${apiLatency}ms\``);
    }
};
