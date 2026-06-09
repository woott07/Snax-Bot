module.exports = {
    name: 'help',
    description: 'Displays all available commands',
    async execute(message, args, client, player, config) {
        const prefix = config.prefix || '$';
        return message.reply(`
🎵 **Music Commands**

\`${prefix}play <song>\` - Play a song or YouTube URL
\`${prefix}join\` - Join your voice channel
\`${prefix}leave\` - Leave the voice channel
\`${prefix}queue\` - Show the current queue interface
\`${prefix}pause\` - Pause playback
\`${prefix}resume\` - Resume playback
\`${prefix}skip\` - Skip to next song
\`${prefix}prev\` - Play previous song from history
\`${prefix}loop\` - Cycle loop mode (Track / Queue / Off)
\`${prefix}autoplay\` - Toggle Autoplay mode

**Other:**
\`${prefix}ping\` - Check bot response
\`${prefix}hello\` - Friendly greeting
`);
    }
};
