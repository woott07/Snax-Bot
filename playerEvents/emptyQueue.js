module.exports = {
    name: 'emptyQueue',
    isPlayer: true,
    async execute(queue, client, player, config) {
        if (queue.metadata.controllerMsg) {
            queue.metadata.controllerMsg.delete().catch(() => { });
            queue.metadata.controllerMsg = null;
        }
        const prefix = config.prefix || '$';
        queue.metadata.channel.send(`🏁 Queue finished! Add more songs with \`${prefix}play\`.`).catch(console.error);
    }
};
