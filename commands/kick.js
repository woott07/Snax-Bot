const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkManagerHierarchy } = require('../utils/permissions');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to kick. Example: `$kick @user`');
        }

        if (target.id === message.author.id) {
            return message.reply('❌ You cannot kick yourself!');
        }

        if (!checkManagerHierarchy(message, target)) {
            return message.reply('❌ As a Manager, you cannot kick someone with a role equal to or higher than yours!');
        }

        if (!target.kickable) {
            return message.reply('❌ I cannot kick this user. Their role might be higher than mine, or I lack Kick Members permission.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setAuthor({ name: 'Kick Confirmation', iconURL: message.author.displayAvatarURL() })
            .setDescription(`Are you sure you want to kick **${target.user.username}** from the server?`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_kick').setLabel('✅ Confirm Kick').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_kick').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary)
        );

        const confirmMsg = await message.reply({ embeds: [embed], components: [row] });

        const filter = i => ['confirm_kick', 'cancel_kick'].includes(i.customId) && i.user.id === message.author.id;
        const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_kick') {
                try {
                    await target.kick(`Kicked by ${message.author.tag}`);
                    embed.setColor('#00ff00').setDescription(`✅ Successfully kicked **${target.user.username}**.`);
                    await i.update({ embeds: [embed], components: [] });
                } catch (error) {
                    console.error('Error kicking user:', error);
                    embed.setColor('#ff0000').setDescription('❌ Failed to kick user. Please check permissions.');
                    await i.update({ embeds: [embed], components: [] });
                }
            } else {
                embed.setColor('#808080').setDescription(`🛑 Kick cancelled.`);
                await i.update({ embeds: [embed], components: [] });
            }
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                embed.setColor('#808080').setDescription('⏳ Kick confirmation timed out.');
                confirmMsg.edit({ embeds: [embed], components: [] }).catch(() => {});
            }
        });
    }
};
