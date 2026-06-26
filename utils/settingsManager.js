const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const SETTINGS_PATH = path.join(__dirname, '../config/settings.json');

function readSettings() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        logger.error(`[SettingsManager] Error reading settings: ${e.message}`);
    }
    return { guilds: {}, global: {} };
}

function writeSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 4), 'utf8');
        return true;
    } catch (e) {
        logger.error(`[SettingsManager] Error writing settings: ${e.message}`);
        return false;
    }
}

function getGuildSetting(guildId, key) {
    const settings = readSettings();
    return settings.guilds?.[guildId]?.[key] || null;
}

function setGuildSetting(guildId, key, value) {
    const settings = readSettings();
    if (!settings.guilds) settings.guilds = {};
    if (!settings.guilds[guildId]) settings.guilds[guildId] = {};
    settings.guilds[guildId][key] = value;
    return writeSettings(settings);
}

function getGlobalSetting(key) {
    const settings = readSettings();
    return settings.global?.[key] || null;
}

function setGlobalSetting(key, value) {
    const settings = readSettings();
    if (!settings.global) settings.global = {};
    settings.global[key] = value;
    return writeSettings(settings);
}

module.exports = {
    getGuildSetting,
    setGuildSetting,
    getGlobalSetting,
    setGlobalSetting
};
