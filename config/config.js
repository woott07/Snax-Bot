require('dotenv').config();
const fileConfig = require('./config.json');

const config = {
    ...fileConfig,
    token: process.env.Bot_Token,
    clientId: process.env.CLIENT_ID,
    ownerId: process.env.OWNER_ID || fileConfig.ownerId || null,
    lavalink: {
        host: process.env.LAVALINK_HOST || 'http://[IP_ADDRESS]',
        port: parseInt(process.env.LAVALINK_PORT || '8080', 10),
        password: process.env.LAVALINK_PASSWORD || '',
        secure: process.env.LAVALINK_SECURE === 'true'
    }
};

module.exports = config;
