function log(message, level = 'info') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let prefix = '[INFO]';
    if (level === 'error') prefix = '\x1b[31m[ERROR]\x1b[0m';
    else if (level === 'warn') prefix = '\x1b[33m[WARN]\x1b[0m';
    else if (level === 'success') prefix = '\x1b[32m[SUCCESS]\x1b[0m';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

module.exports = {
    info: (msg) => log(msg, 'info'),
    error: (msg) => log(msg, 'error'),
    warn: (msg) => log(msg, 'warn'),
    success: (msg) => log(msg, 'success'),
    log
};
