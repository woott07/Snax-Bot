const { Events, ActivityType } = require('discord.js');
const { sendGuildLog } = require('../utils/serverLogger');
const { logGlobal, getOrCreateHomeChannel } = require('../utils/globalLogger');
const logger = require('../utils/logger');
const { deploySlashCommands } = require('../utils/slashDeploy');
const { getGlobalSetting } = require('../utils/settingsManager');
const activity = require('../config/activity.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🤖 Success! Logged in as ${client.user.tag}`);

        // Fetch application info so client.application.owner is populated for dynamic owner permissions
        try {
            await client.application.fetch();
            console.log(`👑 Successfully fetched application owner: ${client.application.owner?.name || client.application.owner?.tag || 'Team'}`);
        } catch (error) {
            console.error('Failed to fetch bot application owner:', error);
        }

        // Check if Home Server is set
        const homeId = getGlobalSetting('homeServerId') || process.env.HOME_SERVER_ID;
        if (!homeId) {
            logger.warn('⚠️  [Ready] HOME_SERVER_ID is not configured. Please use $hsethome to set up the home server for global logs (crashes, joins/leaves).');
        } else {
            // Ensure #global-log exists in home server
            await getOrCreateHomeChannel(client, 'global-log');
        }

        // Log bot startup to home server's #global-log
        const serverCount = client.guilds.cache.size;
        const serverList = client.guilds.cache.map(g => `• **${g.name}** (\`${g.id}\`)`).join('\n').substring(0, 1800);

        await logGlobal(client,
            `` +
            `📊 Active in **${serverCount}** server(s):\n${serverList || '*(none)*'}`
        );

        logger.success(`[Ready] Bot started. Serving ${serverCount} guild(s).`);

        // Deploy slash commands dynamically
        await deploySlashCommands(client);
        client.user.setActivity(activity.name, { type: ActivityType[activity.type] });
        console.log(`Activity set to ${activity.name} and type ${activity.type}`);
    }
};
