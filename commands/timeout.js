module.exports = {
    name: 'timeout',
    description: 'Time out a user for a specific duration in minutes',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Please mention a user to timeout. Example: `$timeout @user 10`');
        }

        const durationInMinutes = parseInt(args[1]);
        if (isNaN(durationInMinutes) || durationInMinutes < 1) {
            return message.reply('❌ Please provide a valid duration in minutes. Example: `$timeout @user 10 spamming`');
        }

        const reason = args.slice(2).join(' ');
        if (!reason) {
            return message.reply('❌ A reason is strictly required for timeouts! Example: `$timeout @user 10 spamming`');
        }

        const durationMs = durationInMinutes * 60 * 1000;

        try {
            await target.timeout(durationMs, `Reason: ${reason} | By: ${message.author.tag}`);
            message.reply(`⏳ **${target.user.username}** has been timed out for **${durationInMinutes}** minute(s) for: *${reason}*`);
        } catch (error) {
            console.error('Error timing out user:', error);
            message.reply('❌ Failed to timeout user. Ensure my role is higher than theirs and I have the `Moderate Members` permission.');
        }
    }
};
