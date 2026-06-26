const { EmbedBuilder } = require('discord.js');

// Palette
const COLORS = {
    success : 0xFF8DA1,  // pink
    error   : 0xFF8DA1,  // pink
    info    : 0xFF8DA1,  // pink
    warn    : 0xFFFFFF,  // white
    neutral : 0xFFFFFF,  // white
};

/**
 * Build and send a clean embed reply.
 *
 * @param {Message}  message  - Discord message object
 * @param {object}   options
 * @param {'success'|'error'|'info'|'warn'|'neutral'} options.type
 * @param {string}   options.title    - Optional bold title line
 * @param {string}   options.desc     - Main description text
 * @param {string}   [options.footer] - Optional footer text
 * @param {boolean}  [options.ephemeral=false] - If true, auto-deletes after 8s
 */
async function reply(message, { type = 'info', title, desc, footer, ephemeral = false } = {}) {
    const color = COLORS[type] ?? COLORS.info;

    let description = '';
    if (title) description += `**${title}**\n`;
    if (desc)  description += desc;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(description.trim() || '\u200b');

    if (footer) embed.setFooter({ text: footer });

    const sent = await message.reply({ embeds: [embed] }).catch(() => null);

    if (ephemeral && sent) {
        setTimeout(() => sent.delete().catch(() => {}), 8000);
    }

    return sent;
}

// ── Shorthand helpers ──────────────────────────────────────────────────────────

/** Green success reply */
reply.ok = (message, desc, opts = {}) =>
    reply(message, { type: 'success', desc, ...opts });

/** Red error reply — auto-deletes after 8s by default */
reply.err = (message, desc, opts = {}) =>
    reply(message, { type: 'error', desc, ephemeral: true, ...opts });

/** Blurple info reply */
reply.info = (message, desc, opts = {}) =>
    reply(message, { type: 'info', desc, ...opts });

/** Yellow warning reply — auto-deletes after 8s by default */
reply.warn = (message, desc, opts = {}) =>
    reply(message, { type: 'warn', desc, ephemeral: true, ...opts });

/** Neutral (dark) reply */
reply.neutral = (message, desc, opts = {}) =>
    reply(message, { type: 'neutral', desc, ...opts });

module.exports = reply;
