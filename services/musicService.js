// This service can be used to abstract away complex discord-player interactions
// Or to manage custom queue/player logic that doesn't fit in command files.
const logger = require('../utils/logger');
const { resolveQuery } = require('../music/searchPipeline');

class MusicService {
    constructor(client, player) {
        this.client = client;
        this.player = player;
    }

    /**
     * Play a track by query or URL.
     * Uses the search pipeline to resolve text queries to YouTube URLs.
     *
     * @param {import('discord.js').Message} message
     * @param {string} query - Text search or URL
     * @returns {Promise<import('discord-player').Track>}
     */
    async play(message, query) {
        try {
            // Resolve query through the search pipeline
            const resolved = await resolveQuery(query);
            logger.info(`[MusicService] Resolved "${query}" → "${resolved.query}" (source: ${resolved.source})`);

            const { track } = await this.player.play(message.member.voice.channel, resolved.query, {
                nodeOptions: {
                    metadata: {
                        channel: message.channel,
                        client: this.client,
                        guild: message.guild
                    }
                }
            });
            return track;
        } catch (e) {
            logger.error(`MusicService Play Error: ${e}`);
            throw e;
        }
    }
}

module.exports = MusicService;
