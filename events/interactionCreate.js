const { Events } = require('discord.js');
const handleMusicInteraction = require('../lavalink_music/interaction');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client, player, config) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('music_')) {
            return await handleMusicInteraction(interaction, client, player, config);
        }
    }
};
