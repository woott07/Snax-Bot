const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays all available music commands',
    async execute(message, args, client, player, config) {
        const prefix = config.prefix || '$';

        const embed = new EmbedBuilder()
            .setColor(config.embedColor || config.embed?.color || '#FF8DA1')
            .setAuthor({ name: 'Snax Bot Help Menu', iconURL: client.user.displayAvatarURL() })
            .setTitle('🎵 Music Commands')
            .setDescription(`
\`${prefix}play <song>\` - Play a song or YouTube URL
\`${prefix}nowplaying\` - Show current playing track info
\`${prefix}queue\` - Show the current queue interface
\`${prefix}volume <0-100>\` - Check or change bot volume
\`${prefix}pause\` / \`${prefix}resume\` - Pause or resume playback
\`${prefix}skip\` / \`${prefix}prev\` - Skip to next/previous song
\`${prefix}remove <number/name>\` - Remove a specific song from queue
\`${prefix}clear\` - Clear the current queue
\`${prefix}shuffle\` - Shuffle the upcoming queue
\`${prefix}loop <number/name>\` - Loop current song or a specific song
\`${prefix}loopQ\` - Toggle loop for the entire queue
\`${prefix}autoplay\` - Toggle Autoplay mode
\`${prefix}stop\` - Stop playback and clear everything
\`${prefix}join\` / \`${prefix}leave\` - Join or leave voice channel
`);

        return message.reply({ embeds: [embed] });
    }
};
