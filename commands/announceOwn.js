const { EmbedBuilder } = require('discord.js');
const { getOrCreateLogChannel } = require('../utils/serverLogger');

module.exports = {
    name: 'announceown',
    aliases: ['announceowner', 'announceOwn'],
    description: 'Sends a global system announcement to all server log channels (Bot Owner Only)',
    async execute(message, args, client, player, config) {
        // Fetch application to find the bot owner
        if (!client.application.owner) {
            await client.application.fetch();
        }

        const owner = client.application.owner;
        let isOwner = false;

        if (owner) {
            if (owner.members) {
                // If it's a team application
                isOwner = owner.members.has(message.author.id);
            } else {
                // If it's an individual developer account
                isOwner = owner.id === message.author.id;
            }
        }

        // Additional safeguard checking local ENV or common debug ID if needed, 
        // but client.application.owner is the official Discord API way.
        if (!isOwner) {
            return message.reply('❌ Only the Bot Owner can use this command.');
        }

        const announcement = args.join(' ');
        if (!announcement) {
            return message.reply(`❌ Please provide the announcement text.\nUsage: \`${config.prefix || '$'}announceOwn <message>\``);
        }

        const statusMessage = await message.reply('📢 Broadcasting announcement to all guild log channels...');

        const guilds = client.guilds.cache;
        let successCount = 0;
        let failCount = 0;

        for (const [guildId, guild] of guilds) {
            try {
                const logChannel = await getOrCreateLogChannel(guild);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#e01b24')
                        .setTitle('📢 Global System Announcement')
                        .setDescription(announcement)
                        .setTimestamp()
                        .setFooter({ text: 'Important notice from the Bot Owner' });

                    await logChannel.send({ embeds: [embed] });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Failed to send announcement to guild ${guild.name} (${guildId}):`, error);
                failCount++;
            }
        }

        await statusMessage.edit(`✅ Announcement sent successfully!\n• Sent to: \`${successCount}\` servers\n• Failed in: \`${failCount}\` servers`);
    }
};
