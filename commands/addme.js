const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'addme',
    description: 'Send a request to join a user\'s Voice Channel',
    async execute(message, args) {
        const requesterChannel = message.member.voice.channel;
        if (!requesterChannel) {
            return message.reply('❌ You must be in a Voice Channel to be moved!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user. Example: `$addme @user`');
        }

        if (target.id === message.author.id) {
            return message.reply('❌ You cannot request to join yourself!');
        }

        const targetChannel = target.voice.channel;
        if (!targetChannel) {
            return message.reply(`❌ **${target.user.username}** is not in a Voice Channel!`);
        }

        if (targetChannel.id === requesterChannel.id) {
            return message.reply(`❌ You are already in the same Voice Channel as **${target.user.username}**!`);
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: 'Voice Join Request', iconURL: message.author.displayAvatarURL() })
            .setDescription(`**${target.user.username}**, ${message.author} wants to join your Voice Channel (**${targetChannel.name}**).\n\nDo you accept?`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('addme_yes').setLabel('✅ Yes').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('addme_no').setLabel('❌ No').setStyle(ButtonStyle.Danger)
        );

        const reqMsg = await message.channel.send({ content: `<@${target.id}>`, embeds: [embed], components: [row] });

        // Collect clicks for 60 seconds
        const filter = i => ['addme_yes', 'addme_no'].includes(i.customId);
        const collector = reqMsg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            // Only the TARGET user can click the buttons
            if (i.user.id !== target.id) {
                return i.reply({ content: '❌ This request is not for you!', flags: 64 });
            }

            if (i.customId === 'addme_yes') {
                try {
                    // Check if requester is still in a VC
                    if (!message.member.voice.channel) {
                        embed.setDescription(`❌ ${message.author} is no longer in a Voice Channel!`);
                        await i.update({ embeds: [embed], components: [] });
                        return collector.stop();
                    }
                    
                    await message.member.voice.setChannel(targetChannel);
                    embed.setColor('#00ff00').setDescription(`✅ **${target.user.username}** accepted! ${message.author} was moved to the channel.`);
                    await i.update({ embeds: [embed], components: [] });
                } catch (err) {
                    console.error('Error moving user:', err);
                    embed.setColor('#ff0000').setDescription(`❌ Failed to move ${message.author}. I might lack \`Move Members\` permission.`);
                    await i.update({ embeds: [embed], components: [] });
                }
            } else {
                embed.setColor('#ff0000').setDescription(`❌ **${target.user.username}** declined the join request.`);
                await i.update({ embeds: [embed], components: [] });
            }
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                embed.setDescription(`⏳ The join request to **${target.user.username}** has expired.`);
                reqMsg.edit({ embeds: [embed], components: [] }).catch(() => {});
            }
        });
    }
};
