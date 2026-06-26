const { createQueueEmbed, createActionRow } = require('./embeds');

async function updateBothControllers(kPlayer, client, config, isExpanded = null) {
    if (isExpanded === null) {
        isExpanded = kPlayer.data.get('isExpanded') || false;
    } else {
        kPlayer.data.set('isExpanded', isExpanded);
    }

    const embed = createQueueEmbed(kPlayer, config, isExpanded);
    const row = createActionRow(isExpanded);

    if (!embed) return;

    const cmdMsg = kPlayer.data.get('controllerMsg');
    const logMsg = kPlayer.data.get('logControllerMsg');

    const updatePromises = [];

    if (cmdMsg) {
        updatePromises.push(
            cmdMsg.edit({ embeds: [embed], components: [row] }).catch(() => null)
        );
    }

    if (logMsg) {
        updatePromises.push(
            logMsg.edit({ embeds: [embed], components: [row] }).catch(() => null)
        );
    }

    await Promise.all(updatePromises);
}

module.exports = async (interaction, client, player, config) => {
    const kPlayer = player.players.get(interaction.guildId);
    if (!kPlayer) {
        try {
            return await interaction.reply({ content: '❌ The player is no longer active.', flags: 64 });
        } catch { return; }
    }

    try {
        switch (interaction.customId) {
            case 'music_pause': {
                const isCurrentlyExpanded = kPlayer.data.get('isExpanded') || false;
                await interaction.deferUpdate();
                await kPlayer.pause(!kPlayer.paused);
                await updateBothControllers(kPlayer, client, config, isCurrentlyExpanded);
                break;
            }

            case 'music_skip':
                await interaction.deferUpdate();
                await kPlayer.skip();
                break;

            case 'music_stop': {
                await interaction.deferUpdate();
                const oldCmdMsg = kPlayer.data.get('controllerMsg');
                if (oldCmdMsg) await oldCmdMsg.delete().catch(() => {});
                const oldLogMsg = kPlayer.data.get('logControllerMsg');
                if (oldLogMsg) await oldLogMsg.delete().catch(() => {});
                kPlayer.destroy();
                break;
            }

            case 'music_expand': {
                await interaction.deferUpdate();
                await updateBothControllers(kPlayer, client, config, true);
                break;
            }

            case 'music_collapse': {
                await interaction.deferUpdate();
                await updateBothControllers(kPlayer, client, config, false);
                break;
            }
        }
    } catch (err) {
        console.error('[Button Error]:', err.message);
    }
};
