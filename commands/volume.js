module.exports = {
    name: 'volume',
    description: 'Adjust the player volume',
    execute: async (message, args, client, player) => {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ No music is currently playing.');
        }

        if (!args[0]) {
            return message.reply(`🔊 Current volume is **${queue.node.volume}%**`);
        }

        const vol = parseInt(args[0], 10);
        if (isNaN(vol) || vol < 0 || vol > 200) {
            return message.reply('❌ Please provide a valid number between 0 and 200.');
        }

        queue.node.setVolume(vol);
        message.reply(`✅ Volume set to **${vol}%**`);
    }
};
