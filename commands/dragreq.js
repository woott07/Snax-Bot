const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'dragreq',
    description: 'Send a request to drag a user to your Voice Channel',
    async execute(message, args) {
        const requesterChannel = message.member.voice.channel;
        if (!requesterChannel) {
            return message.reply('❌ You must be in a Voice Channel to use this command!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user. Example: `$dragreq @user`');
        }

        if (target.id === message.author.id) {
            return message.reply('❌ You cannot drag yourself!');
        }

        const targetChannel = target.voice.channel;
        if (!targetChannel) {
            return message.reply(`❌ Tell **${target.user.username}** to join a Voice Channel first!`);
        }

        if (targetChannel.id === requesterChannel.id) {
            return message.reply(`❌ **${target.user.username}** is already in your Voice Channel!`);
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: 'Voice Drag Request', iconURL: message.author.displayAvatarURL() })
            .setDescription(`**${target.user.username}**, ${message.author} wants to drag you to their Voice Channel (**${requesterChannel.name}**).\n\nDo you accept?`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('drag_yes').setLabel('✅ Yes').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('drag_no').setLabel('❌ No').setStyle(ButtonStyle.Danger)
        );

        const reqMsg = await message.channel.send({ content: `<@${target.id}>`, embeds: [embed], components: [row] });

        // Collect clicks for 60 seconds
        const filter = i => ['drag_yes', 'drag_no'].includes(i.customId);
        const collector = reqMsg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            // Only the TARGET user can click the buttons
            if (i.user.id !== target.id) {
                return i.reply({ content: '❌ This request is not for you!', flags: 64 });
            }

            if (i.customId === 'drag_yes') {
                try {
                    // Check again if they are still in a VC
                    if (!target.voice.channel) {
                        embed.setDescription('❌ You are no longer in a Voice Channel!');
                        await i.update({ embeds: [embed], components: [] });
                        return collector.stop();
                    }
                    
                    await target.voice.setChannel(requesterChannel);
                    embed.setColor('#00ff00').setDescription(`✅ **${target.user.username}** accepted the request and was moved!`);
                    await i.update({ embeds: [embed], components: [] });
                } catch (err) {
                    console.error('Error dragging user:', err);
                    embed.setColor('#ff0000').setDescription(`❌ Failed to move **${target.user.username}**. I might lack \`Move Members\` permission.`);
                    await i.update({ embeds: [embed], components: [] });
                }
            } else {
                embed.setColor('#ff0000').setDescription(`❌ **${target.user.username}** declined the drag request.`);
                await i.update({ embeds: [embed], components: [] });
            }
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                embed.setDescription(`⏳ The drag request to **${target.user.username}** has expired.`);
                reqMsg.edit({ embeds: [embed], components: [] }).catch(() => {});
            }
        });
    }
};
