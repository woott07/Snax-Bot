const { createQueueEmbed, createActionRow } = require('./embeds');

module.exports = async (interaction, client, player, config) => {
    const kPlayer = player.players.get(interaction.guildId);
    if (!kPlayer) {
        try {
            return await interaction.reply({ content: '❌ The player is no longer active.', flags: 64 });
        } catch { return; }
    }

    try {
        switch (interaction.customId) {
            case 'music_back':
                await interaction.reply({ content: '⏮️ Track history isn\'t available.', flags: 64 });
                break;

            case 'music_pause': {
                const isCurrentlyExpanded = interaction.message.components[0]?.components[4]?.customId === 'music_collapse';
                await kPlayer.pause(!kPlayer.paused);
                const embed = createQueueEmbed(kPlayer, config, isCurrentlyExpanded);
                if (embed) {
                    await interaction.update({
                        embeds: [embed],
                        components: [createActionRow(isCurrentlyExpanded)]
                    });
                } else {
                    await interaction.deferUpdate();
                }
                break;
            }

            case 'music_skip':
                await interaction.deferUpdate();
                await kPlayer.skip();
                break;

            case 'music_stop':
                kPlayer.destroy();
                await interaction.update({ content: '⏹️ Stopped.', embeds: [], components: [] });
                break;

            case 'music_expand': {
                const embedExp = createQueueEmbed(kPlayer, config, true);
                if (embedExp) {
                    await interaction.update({
                        embeds: [embedExp],
                        components: [createActionRow(true)]
                    });
                } else {
                    await interaction.deferUpdate();
                }
                break;
            }

            case 'music_collapse': {
                const embedCol = createQueueEmbed(kPlayer, config, false);
                if (embedCol) {
                    await interaction.update({
                        embeds: [embedCol],
                        components: [createActionRow(false)]
                    });
                } else {
                    await interaction.deferUpdate();
                }
                break;
            }
        }
    } catch (err) {
        console.error('[Button Error]:', err.message);
    }
};
