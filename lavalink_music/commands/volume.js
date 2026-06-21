const reply = require('../../utils/reply');

module.exports = {
    name: 'volume',
    aliases: ['vol'],
    description: 'Adjust the player volume (0–200)',
    execute: async (message, args, client, player) => {
        const kPlayer = player.players.get(message.guild.id);
        if (!kPlayer || !kPlayer.playing) return reply.err(message, 'Nothing is playing right now.');

        if (!args[0]) {
            return reply.info(message, `🔊  Current volume: **${kPlayer.volume}%**`);
        }

        const vol = parseInt(args[0], 10);
        if (isNaN(vol) || vol < 0 || vol > 200) {
            return reply.err(message, 'Please enter a number between **0** and **200**.');
        }

        await kPlayer.setVolume(vol);
        return reply.ok(message, `🔊  Volume set to **${vol}%**`, { ephemeral: true });
    }
};
