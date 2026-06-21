module.exports = {
    name: 'volume',
    aliases: ['vol'],
    description: 'Adjust the player volume (0–200)',
    execute: async (message, args, client, player) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) {
            return message.reply('❌ Nothing is playing right now.');
        }

        if (!args[0]) {
            return message.reply(`🔊 Volume is at **${kPlayer.volume}%**`);
        }

        const vol = parseInt(args[0], 10);
        if (isNaN(vol) || vol < 0 || vol > 200) {
            return message.reply('❌ Please enter a number between **0** and **200**.');
        }

        await kPlayer.setVolume(vol);
        return message.reply(`🔊 Volume set to **${vol}%**`);
    }
};
