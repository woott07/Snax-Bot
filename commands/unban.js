module.exports = {
    name: 'unban',
    description: 'Unban a user from the server using their ID',
    async execute(message, args) {
        const targetId = args[0];
        
        if (!targetId || isNaN(targetId)) {
            return message.reply('❌ Please provide the User ID to unban. Example: `$unban 123456789012345678`');
        }

        try {
            await message.guild.members.unban(targetId, `Unbanned by ${message.author.tag}`);
            message.reply(`✅ Successfully unbanned user with ID **${targetId}**.`);
        } catch (error) {
            console.error('Error unbanning user:', error);
            message.reply('❌ Failed to unban user. Make sure the ID is correct and I have `Ban Members` permission.');
        }
    }
};
