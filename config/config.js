require('dotenv').config();
const fileConfig = require('./config.json');

const config = {
    ...fileConfig,
    token: process.env.Bot_Token,
    clientId: process.env.CLIENT_ID,
    lavalink: {
        host: process.env.LAVALINK_HOST || 'lava-v4.ajieblogs.eu.org',
        port: parseInt(process.env.LAVALINK_PORT || '443', 10),
        password: process.env.LAVALINK_PASSWORD || 'https://dsc.gg/ajidevserver',
        secure: process.env.LAVALINK_SECURE === 'true'
    }
};

module.exports = config;
