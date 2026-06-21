const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    play: {
        options: [
            {
                name: 'query',
                description: 'The song name or URL to play',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    volume: {
        options: [
            {
                name: 'level',
                description: 'Volume level (0-100)',
                type: ApplicationCommandOptionType.Integer,
                required: false
            }
        ]
    },
    loop: {
        options: [
            {
                name: 'song',
                description: 'Song number or title to skip to and loop (optional)',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};
