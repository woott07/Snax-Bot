const { createQueueEmbed, createActionRow } = require('./embeds');

module.exports = async (interaction, client, player, config) => {
    const queue = player.nodes.get(interaction.guildId);
    if (!queue) {
        try {
            return await interaction.reply({ content: '❌ This control panel is expired or inactive.', flags: 64 });
        } catch { return; }
    }

    try {
        switch (interaction.customId) {
            case 'music_back':
                if (queue.history.isEmpty()) {
                    await interaction.reply({ content: '⏮️ No track history exists!', flags: 64 });
                } else {
                    await interaction.deferUpdate();
                    await queue.history.previous();
                }
                break;

            case 'music_pause': {
                const isCurrentlyExpanded = interaction.message.components[0]?.components[4]?.customId === 'music_collapse';
                if (queue.node.isPaused()) {
                    queue.node.resume();
                } else {
                    queue.node.pause();
                }
                const embed = createQueueEmbed(queue, config, isCurrentlyExpanded);
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
                queue.node.skip();
                break;

            case 'music_stop':
                queue.delete();
                await interaction.update({ content: '🛑 Playback terminated. Controller closed.', embeds: [], components: [] });
                break;

            case 'music_expand': {
                const embedExp = createQueueEmbed(queue, config, true);
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
                const embedCol = createQueueEmbed(queue, config, false);
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
        console.error('Button interaction error (ignored):', err.message);
    }
};
