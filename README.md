# 🎵 Snax Multi-Purpose Discord Bot

Welcome to **Snax**! A highly modular, dynamic, and powerful Discord bot combining a full-featured music player powered by **Lavalink**, a custom Role-Based Access Control (RBAC) permission system, server moderation tools, nickname controls, and automated anti-spam protection.

---

## 🔗 Invite Snax to Your Server!
[Click here to invite the bot!](https://discord.com/oauth2/authorize?client_id=1479181184696193154&permissions=8&integration_type=0&scope=bot+applications.commands)

---

## ✨ Features

- **Decoupled Architecture**: Commands, events, and player log pipelines are dynamically loaded. General utilities and music systems are cleanly isolated.
- **Lavalink Music System**: Low-overhead high-quality audio streaming powered by Kazagumo/Shoukaku (Lavalink node). Includes an interactive media controller embed with play/pause, skip, loop, autoplay, and stop buttons.
- **Custom RBAC Permission System**: Highly granular, per-guild permission database (`data/permissions.json`) supporting role/member groups (`AdminExe`, `ManagerExe`, `VoiceExe`, `setNickExe`, `ChatExe`, `Default`, `BypassExe`, `SupBypass`). Bypasses checks dynamically for server/bot owners.
- **Proactive Role Hierarchy Warnings**: Automatically scans server roles on startup and guild join. Warns administrators in the `#snax-log` channel if the bot needs to be manually dragged higher in Server Settings to change nicknames or moderate members.
- **Anti-Spam Filter**: Rolling-window spam protection that automatically issues warnings and 2-minute timeouts to spammers. Bypassed by moderators and custom exception groups.
- **Private Automated Logging**: Automatically creates a secure `#snax-log` channel in your server where only Admins and the bot can read/write logs.
- **Management & Moderation**: Built-in commands to `$ban` and `$kick` (with interactive button prompts), `$timeout` (with role hierarchy validations), `$purge` (safely capped at 100 to prevent API crashes), `$setnick` and `$remnick` (to manage nicknames), and `$fetch` (to inspect role/member permission scopes).

---

## 📁 Project Structure

Here's a look at how the bot is organized:

```text
Snax-Bot/
├── index.js                  — Entry point. Initializes client, handlers, and logs in.
├── config/
│   ├── config.json           — Runtime settings (prefix, volume, leave settings)
│   ├── config.js             — Configuration loader merging config.json with .env
│   └── slashOptionsMap.js    — Slash option definitions for music commands
├── commands/                 — Non-music command files (moderation, nicknames, permissions)
├── lavalink_music/           — Lavalink audio streaming module
│   ├── player.js             — Kazagumo player manager and Lavalink initialization
│   ├── interaction.js        — Embed media controller button interaction handler
│   ├── embeds.js             — Embed builders for Queue / Now Playing UIs
│   ├── commands/             — 13 music prefix/slash commands (play, skip, autoplay)
│   └── events/               — Player events (playerStart, playerEmpty, error)
├── events/                   — Client events (messageCreate, ready, interactionCreate, guildCreate, guildDelete)
├── handlers/                 — Dynamic loaders that bootstrap client commands and events
├── utils/                    — Core system utilities:
│   ├── permissions.js        — Custom RBAC permissions database manager and resolver
│   ├── antiSpam.js           — Rolling-window message frequency spam filter
│   ├── serverLogger.js       — In-server logger and role hierarchy checks
│   ├── globalLogger.js       — Home-server developer log manager
│   ├── logger.js             — Colorized terminal logging utilities
│   ├── voiceCheck.js         — VC presence and music permissions helper
│   └── slashDeploy.js        — Dynamic registration of slash commands
├── data/
│   └── permissions.json      — Local guild permissions database
├── install.bat               — 1-Click installer for Windows (installs dependencies in-folder)
└── setup_mac.sh              — Setup script for macOS/Linux environments
```

---

## 🚀 Getting Started

The installation process isolates everything to this folder. It does not install anything globally.

### 1. Prerequisites
Ensure you have [Node.js v18 or higher](https://nodejs.org/) installed.

### 2. Setup
Run the setup script for your operating system:
* **Windows**: Double-click `install.bat`.
* **macOS / Linux**: Run `bash setup_mac.sh` in your terminal.

This will run `npm install` and create your `.env` configuration file.

### 3. Credentials Setup
Open the generated `.env` file and insert your credentials:
```env
Bot_Token=YOUR_DISCORD_BOT_TOKEN
OWNER_ID=YOUR_USER_ID
LAVALINK_HOST=lava-v4.ajieblogs.eu.org
LAVALINK_PORT=443
LAVALINK_PASSWORD=https://dsc.gg/ajidevserver
LAVALINK_SECURE=true
```

### 4. Run the Bot
Start the bot using:
```bash
node index.js
```

---

## 📝 License
Feel free to use, modify, and distribute this codebase for your own Discord servers! Enjoy the music and utility features! 🎧
