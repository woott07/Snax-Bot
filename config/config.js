require('dotenv').config();
const fileConfig = require('./config.json');

const config = {
    ...fileConfig,
    token: process.env.Bot_Token,
    clientId: process.env.CLIENT_ID
};

module.exports = config;
