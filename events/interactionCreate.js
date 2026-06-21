const { Events, Collection, ApplicationCommandOptionType } = require('discord.js');
const handleMusicInteraction = require('../lavalink_music/interaction');
const { hasPermission } = require('../utils/permissions');
const { logForServer, buildErrorEmbed } = require('../utils/globalLogger');
const { checkSpam } = require('../utils/antiSpam');
const reply = require('../utils/reply');
const slashOptionsMap = require('../config/slashOptionsMap');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client, player, config) {
        // Handle button interactions
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('music_')) {
                return await handleMusicInteraction(interaction, client, player, config);
            }
            return;
        }

        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName;
            const command = client.commands.get(commandName);
            if (!command) return;

            // Only allow execution of music slash commands (marked with isMusic = true)
            if (!command.isMusic) {
                return await interaction.reply({
                    content: '❌ This command is not supported as a slash command.',
                    ephemeral: true
                });
            }

            // Create Mock Message object to pass to execute()
            const mockMessage = {
                guild: interaction.guild,
                author: interaction.user,
                member: interaction.member,
                channel: interaction.channel,
                client: interaction.client,
                createdTimestamp: interaction.createdTimestamp,
                mentions: {
                    members: new Collection(),
                    users: new Collection(),
                    roles: new Collection(),
                },
                reply: async (content) => {
                    const payload = typeof content === 'string' ? { content } : content;
                    
                    if (interaction.replied) {
                        return await interaction.followUp({ ...payload, fetchReply: true });
                    }
                    if (interaction.deferred) {
                        return await interaction.editReply(payload);
                    }
                    return await interaction.reply({ ...payload, fetchReply: true });
                }
            };

            // Run anti-spam checks
            if (checkSpam(mockMessage)) return;

            // Run custom RBAC permission checks
            if (!hasPermission(mockMessage, command.name)) {
                return reply.err(mockMessage, "🔒  You don't have permission to use this command.");
            }

            // Parse slash options to populate `args` and `mentions`
            let args = [];
            const cmdConfig = slashOptionsMap[commandName];
            
            if (cmdConfig && cmdConfig.options) {
                for (const opt of cmdConfig.options) {
                    let val;
                    if (opt.type === ApplicationCommandOptionType.User) {
                        const user = interaction.options.getUser(opt.name);
                        if (user) {
                            val = `<@${user.id}>`;
                            mockMessage.mentions.users.set(user.id, user);
                            const member = interaction.options.getMember(opt.name);
                            if (member) mockMessage.mentions.members.set(user.id, member);
                        }
                    } else if (opt.type === ApplicationCommandOptionType.Role) {
                        const role = interaction.options.getRole(opt.name);
                        if (role) {
                            val = `<@&${role.id}>`;
                            mockMessage.mentions.roles.set(role.id, role);
                        }
                    } else if (opt.type === ApplicationCommandOptionType.Mentionable) {
                        const mentionable = interaction.options.getMentionable(opt.name);
                        if (mentionable) {
                            if (mentionable.roles) {
                                val = `<@${mentionable.id}>`;
                                mockMessage.mentions.users.set(mentionable.user.id, mentionable.user);
                                mockMessage.mentions.members.set(mentionable.user.id, mentionable);
                            } else if (mentionable.hexColor) {
                                val = `<@&${mentionable.id}>`;
                                mockMessage.mentions.roles.set(mentionable.id, mentionable);
                            } else {
                                val = `<@${mentionable.id}>`;
                                mockMessage.mentions.users.set(mentionable.id, mentionable);
                            }
                        }
                    } else if (opt.type === ApplicationCommandOptionType.Integer) {
                        const intVal = interaction.options.getInteger(opt.name);
                        if (intVal !== null && intVal !== undefined) val = String(intVal);
                    } else if (opt.type === ApplicationCommandOptionType.Boolean) {
                        const boolVal = interaction.options.getBoolean(opt.name);
                        if (boolVal !== null && boolVal !== undefined) val = String(boolVal);
                    } else {
                        val = interaction.options.getString(opt.name);
                    }

                    if (val !== undefined && val !== null) {
                        args.push(val);
                    }
                }
            }

            // Execute the command using the adapter
            try {
                await command.execute(mockMessage, args, client, player, config);
            } catch (error) {
                console.error(`Error executing slash command ${commandName}:`, error);
                
                try {
                    await reply.err(mockMessage, '⚠️  Something went wrong running that command.\n-# Try again or contact an admin if it keeps happening.');
                } catch (_) {}

                // Log error to home server log channel
                const errorEmbed = buildErrorEmbed({
                    guild: interaction.guild,
                    context: `Slash Command: \`${commandName}\` used by ${interaction.user.tag}`,
                    error: error.stack || error.message || error,
                });
                await logForServer(client, interaction.guild, { embeds: [errorEmbed] });
            }
        }
    }
};
