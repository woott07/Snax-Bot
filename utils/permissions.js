const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const permFile = path.join(dataDir, 'permissions.json');

// Ensure data directory and permissions file exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(permFile)) {
    fs.writeFileSync(permFile, JSON.stringify({}), 'utf-8');
}

// Group definitions
const COMMAND_GROUPS = {
    'AdminExe': ['VoiceExe', 'remVoiceExe', 'setNickExe', 'remNickExe', 'assign_default', 'default_remove', 'AdminExe', 'remAdminExe', 'ChatExe', 'remChatExe', 'ManagerExe', 'remManagerExe', 'BypassExe', 'remBypassExe', 'SupBypass', 'remSupBypass', 'setprefix', 'remprefix'],
    'ManagerExe': ['ban', 'unban', 'kick'],
    'VoiceExe': ['mute', 'unmute', 'deafen', 'undeafen', 'dragreq', 'addme'],
    'setNickExe': ['setnick'],
    'ChatExe': ['purge', 'timeout'],
    'Default': [
        'play', 'skip', 'queue', 'ping', 'help', 'hello', 'nowplaying', 
        'volume', 'pause', 'resume', 'prev', 'remove', 'clear', 
        'shuffle', 'loop', 'loopQ', 'autoplay', 'stop', 'join', 'leave'
    ]
};

function readDB() {
    try {
        const data = fs.readFileSync(permFile, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function writeDB(data) {
    fs.writeFileSync(permFile, JSON.stringify(data, null, 4), 'utf-8');
}

function getGuildConfig(guildId) {
    const db = readDB();
    if (!db[guildId]) {
        db[guildId] = {
            Default: ['@everyone'],
            VoiceExe: [],
            setNickExe: [],
            AdminExe: [],
            pendingAdminExe: {}, // format: { "roleOrUserId": expirationTimestamp }
            ChatExe: [],
            ManagerExe: [],
            BypassExe: [],
            SupBypass: []
        };
    }
    
    // Ensure all keys exist for backward compatibility
    ['BypassExe', 'SupBypass', 'pendingAdminExe'].forEach(key => {
        if (!db[guildId][key]) {
            db[guildId][key] = key === 'pendingAdminExe' ? {} : [];
        }
    });

    return db[guildId];
}

function saveGuildConfig(guildId, config) {
    const db = readDB();
    db[guildId] = config;
    writeDB(db);
}

// Check and move pending admins to actual admins if 10 mins have passed
function applyPendingAdmins(guildId) {
    const config = getGuildConfig(guildId);
    let modified = false;
    const now = Date.now();

    for (const [targetId, unlockTime] of Object.entries(config.pendingAdminExe)) {
        if (now >= unlockTime) {
            // 10 minutes passed! Move to AdminExe
            if (!config.AdminExe.includes(targetId)) {
                config.AdminExe.push(targetId);
            }
            delete config.pendingAdminExe[targetId];
            modified = true;
        }
    }

    if (modified) {
        saveGuildConfig(guildId, config);
    }
    return config; // Return the updated config
}

function getGroupForCommand(commandName) {
    for (const [groupName, commands] of Object.entries(COMMAND_GROUPS)) {
        if (commands.includes(commandName)) return groupName;
    }
    return 'OwnerOnly';
}

function hasPermission(message, commandName) {
    if (message.guild.ownerId === message.author.id) return true;

    // Trigger check for pending admins
    const config = applyPendingAdmins(message.guild.id);
    const userRoleIds = message.member.roles.cache.map(r => r.id);

    // ADMIN OVERRIDE: AdminExe users bypass all permission checks
    const adminIds = config['AdminExe'] || [];
    const isAdmin = adminIds.includes(message.author.id) || adminIds.some(id => userRoleIds.includes(id));
    if (isAdmin) return true;

    const groupName = getGroupForCommand(commandName);
    if (groupName === 'OwnerOnly') return false; 

    // ALLOW MANAGERS TO ASSIGN LOWER POWERS
    const allowedManagerCommands = ['VoiceExe', 'remVoiceExe', 'setNickExe', 'remNickExe', 'assign_default', 'default_remove'];
    if (allowedManagerCommands.includes(commandName)) {
        const managerIds = config['ManagerExe'] || [];
        const isManager = managerIds.includes(message.author.id) || managerIds.some(id => userRoleIds.includes(id));
        if (isManager) return true;
    }

    const allowedIds = config[groupName] || [];

    if (allowedIds.includes('@everyone')) return true;

    return allowedIds.includes(message.author.id) || allowedIds.some(id => userRoleIds.includes(id));
}

// Specialized function to check if user has a specific group (for spam filter, etc.)
function hasGroup(message, groupName) {
    if (message.guild.ownerId === message.author.id) return true;
    const config = applyPendingAdmins(message.guild.id);
    const userRoleIds = message.member.roles.cache.map(r => r.id);
    
    // Admins have all groups implicitly
    const adminIds = config['AdminExe'] || [];
    if (adminIds.includes(message.author.id) || adminIds.some(id => userRoleIds.includes(id))) return true;

    const allowedIds = config[groupName] || [];
    if (allowedIds.includes('@everyone')) return true;

    return allowedIds.includes(message.author.id) || allowedIds.some(id => userRoleIds.includes(id));
}

function addTarget(guildId, groupName, targetId) {
    const config = getGuildConfig(guildId);
    
    if (groupName === 'AdminExe') {
        // Special logic: 10 minute cooldown
        if (config.AdminExe.includes(targetId)) return 'already_admin';
        
        const tenMinutes = 10 * 60 * 1000;
        config.pendingAdminExe[targetId] = Date.now() + tenMinutes;
        saveGuildConfig(guildId, config);
        return 'pending';
    }

    if (!config[groupName]) config[groupName] = [];
    if (!config[groupName].includes(targetId)) {
        config[groupName].push(targetId);
        saveGuildConfig(guildId, config);
        return true;
    }
    return false;
}

function removeTarget(guildId, groupName, targetId) {
    const config = getGuildConfig(guildId);

    if (groupName === 'AdminExe') {
        // Remove from pending as well
        if (config.pendingAdminExe && config.pendingAdminExe[targetId]) {
            delete config.pendingAdminExe[targetId];
        }
    }

    if (!config[groupName]) return false;
    
    const index = config[groupName].indexOf(targetId);
    if (index > -1) {
        config[groupName].splice(index, 1);
        saveGuildConfig(guildId, config);
        return true;
    }
    return false;
}

function checkManagerHierarchy(message, targetMember) {
    // Owner bypass
    if (message.guild.ownerId === message.author.id) return true;
    
    // Check if the author is just a Manager (not Admin)
    const config = applyPendingAdmins(message.guild.id);
    const userRoleIds = message.member.roles.cache.map(r => r.id);
    
    const adminIds = config['AdminExe'] || [];
    const isAdmin = adminIds.includes(message.author.id) || adminIds.some(id => userRoleIds.includes(id));
    
    // If Admin, they bypass hierarchy
    if (isAdmin) return true;

    // Otherwise they are just a Manager, enforce hierarchy
    const authorPosition = message.member.roles.highest.position;
    const targetPosition = targetMember.roles.highest.position;

    return authorPosition > targetPosition;
}

function getGuildPrefix(guildId) {
    const config = getGuildConfig(guildId);
    return config.customPrefix || null;
}

function setGuildPrefix(guildId, newPrefix) {
    const config = getGuildConfig(guildId);
    config.customPrefix = newPrefix;
    saveGuildConfig(guildId, config);
}

module.exports = {
    hasPermission,
    hasGroup,
    addTarget,
    removeTarget,
    checkManagerHierarchy,
    getGuildPrefix,
    setGuildPrefix
};
