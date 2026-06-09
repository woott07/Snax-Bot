module.exports = {
    name: 'setnick',
    description: 'Changes the nickname of a user or the bot itself',
    async execute(message, args) {
        const target = message.mentions.members.first();
        let newNickname = '';

        if (target) {
            // Remove the mention from the args to get the actual nickname
            args.shift();
            newNickname = args.join(' ');

            // Check if bot can change this user's nickname (role hierarchy)
            if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply(`❌ I cannot change the nickname of **${target.user.username}** because their role is higher than or equal to mine!`);
            }
        } else {
            // No target mentioned, so we change the target to the bot itself
            newNickname = args.join(' ');
        }

        if (!newNickname && !target) {
            return message.reply('❌ Please mention a user or provide a new nickname. Example: `$setnick @user NewName` or `$setnick NewName`');
        }

        const targetMember = target || message.guild.members.me;

        try {
            await targetMember.setNickname(newNickname || null); // null resets the nickname
            message.reply(`✅ Successfully changed nickname to **${newNickname || targetMember.user.username}**`);
        } catch (error) {
            console.error('Error setting nickname:', error);
            message.reply('❌ An error occurred while trying to set the nickname. Make sure I have proper permissions.');
        }
    }
};
