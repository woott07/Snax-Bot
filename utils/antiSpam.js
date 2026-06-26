const config = require('../config/config');

// In-memory store for message timestamps
const userMessages = new Map();

function checkSpam(message) {
    if (message.author.bot || !message.guild) return false;

    const isBotOwner = config.ownerId === message.author.id;
    const isGuildOwner = message.guild.ownerId === message.author.id;
    const isAdmin = message.member?.permissions.has('Administrator');
    const isManager = message.member?.permissions.has('ManageGuild') || message.member?.permissions.has('ManageMessages');

    // Check if user is immune (owner, administrator, or managers)
    if (isBotOwner || isGuildOwner || isAdmin || isManager) {
        return false;
    }

    const userId = message.author.id;
    const now = Date.now();
    const windowMs = 10000; // 10 seconds rolling window

    if (!userMessages.has(userId)) {
        userMessages.set(userId, []);
    }

    const timestamps = userMessages.get(userId);
    timestamps.push(now);

    // Remove timestamps older than the window
    while (timestamps.length > 0 && timestamps[0] < now - windowMs) {
        timestamps.shift();
    }

    const msgCount = timestamps.length;
    
    // Limits: warning at 4 messages, timeout at 7 messages.
    const warnLimit = 4;
    const timeoutLimit = 7;

    if (msgCount === warnLimit) {
        message.channel.send(`⚠️ **${message.author.username}**, please stop spamming! You are sending messages too fast.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } else if (msgCount === timeoutLimit) {
        message.channel.send(`🛑 **${message.author.username}** has been timed out for 2 minutes due to spamming.`);
        
        // Timeout for 2 minutes (120000 ms)
        if (message.member && message.member.moderatable) {
            message.member.timeout(120000, 'Spamming (Automated filter)')
                .catch(err => console.error('Failed to timeout spammer:', err));
        }
            
        timestamps.length = 0; // Reset counter to prevent repeated timeouts instantly
        return true; // Indicates spam detected & action taken
    }
    
    return false;
}

module.exports = { checkSpam };
