module.exports = {
    name: 'purge',
    description: 'Deletes a specified number of messages from the channel',
    async execute(message, args) {
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Please provide a number between 1 and 100. Example: `$purge 10`');
        }

        try {
            // Delete the command message + the requested amount
            const fetched = await message.channel.messages.fetch({ limit: Math.min(amount + 1, 100) });
            await message.channel.bulkDelete(fetched, true);

            const confirmation = await message.channel.send(`✅ Successfully deleted **${amount}** messages.`);
            setTimeout(() => confirmation.delete().catch(() => {}), 3000);
        } catch (error) {
            console.error('Error purging messages:', error);
            message.reply('❌ An error occurred. Note: I can only bulk-delete messages that are under 14 days old and I need `Manage Messages` permission.');
        }
    }
};
