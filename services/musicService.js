// This service can be used to abstract away complex discord-player interactions
// Or to manage custom queue/player logic that doesn't fit in command files.
const logger = require('../utils/logger');

class MusicService {
    constructor(client, player) {
        this.client = client;
        this.player = player;
    }

    async play(message, query) {
        try {
            const { track } = await this.player.play(message.member.voice.channel, query, {
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
