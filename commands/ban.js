const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkManagerHierarchy } = require('../utils/permissions');

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to ban. Example: `$ban @user`');
        }

        if (target.id === message.author.id) {
            return message.reply('❌ You cannot ban yourself!');
        }

        if (!checkManagerHierarchy(message, target)) {
            return message.reply('❌ As a Manager, you cannot ban someone with a role equal to or higher than yours!');
        }

        if (!target.bannable) {
            return message.reply('❌ I cannot ban this user. Their role might be higher than mine, or I lack Ban Members permission.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: 'Ban Confirmation', iconURL: message.author.displayAvatarURL() })
            .setDescription(`Are you sure you want to **PERMANENTLY BAN** **${target.user.username}** from the server?`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_ban').setLabel('🔨 Confirm Ban').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_ban').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary)
        );

        const confirmMsg = await message.reply({ embeds: [embed], components: [row] });

        const filter = i => ['confirm_ban', 'cancel_ban'].includes(i.customId) && i.user.id === message.author.id;
        const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_ban') {
                try {
                    await target.ban({ reason: `Banned by ${message.author.tag}` });
                    embed.setColor('#00ff00').setDescription(`🔨 Successfully banned **${target.user.username}**.`);
                    await i.update({ embeds: [embed], components: [] });
                } catch (error) {
                    console.error('Error banning user:', error);
                    embed.setColor('#ff0000').setDescription('❌ Failed to ban user. Please check permissions.');
                    await i.update({ embeds: [embed], components: [] });
                }
            } else {
                embed.setColor('#808080').setDescription(`🛑 Ban cancelled.`);
                await i.update({ embeds: [embed], components: [] });
            }
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                embed.setColor('#808080').setDescription('⏳ Ban confirmation timed out.');
                confirmMsg.edit({ embeds: [embed], components: [] }).catch(() => {});
            }
        });
    }
};
