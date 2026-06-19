const { Events } = require('discord.js');
const handleMusicInteraction = require('../music/interaction');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client, player, config) {
        if (!interaction.isButton()) return;

        // Route music buttons to the isolated music interaction handler
        if (interaction.customId.startsWith('music_')) {
            return await handleMusicInteraction(interaction, client, player, config);
        }
    }
};
