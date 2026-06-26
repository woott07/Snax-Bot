# 🎵 Snax Bot

Welcome to **Snax**! A high-performance, robust, and clean Discord music bot. Snax is built from the ground up to provide crystal-clear audio streaming using **Lavalink**, combined with interactive media embeds, anti-spam mechanisms, and automatic error logging.

---

## 🔗 Invite Snax to Your Server!
[Click here to invite the bot to your Discord server!](https://discord.com/oauth2/authorize?client_id=1479181184696193154&permissions=8&integration_type=0&scope=bot+applications.commands)

---

## ✨ Features

- **Lavalink Integration**: Low-overhead high-quality audio streaming powered by Kazagumo/Shoukaku.
- **Interactive Embed Controller**: Direct button controls (Play/Pause, Skip, Loop, Autoplay, Stop) on player status cards.
- **Autoplay Mode**: Automatically queues up related recommendations when the current track finishes.
- **Anti-Spam Filter**: Automatically prevents command flooding with rolling-window frequency checks and 2-minute timeouts for spammers (server admins are automatically immune).
- **Custom Music Log Channels**: Configure a custom log channel using `$setup` (`/setup`) where the bot streams the playing controller and updates playback status in real-time.
- **Global Crash Logging**: Automatically routes developer logs (crashes, startup info, bot joins/leaves) to the home server's log channel configured via `$hsethome` (`/hsethome`).
- **Hybrid Controls**: Supports both prefix commands (default `$`) and slash commands (`/`).

---

## 📁 Project Structure

Here is how the bot's codebase is structured:

```text
Snax-Bot/
├── index.js                  — Entry point initializing the bot and client connections.
├── config/
│   ├── config.json           — Runtime settings (default volume, prefix, leave-voice options).
│   ├── config.js             — Configuration builder integrating config.json with .env.
│   ├── slashOptionsMap.js    — Configuration options for slash commands.
│   └── activity.json         — Set status activity.
├── lavalink_music/           — Lavalink music sub-system.
│   ├── commands/             — All music command files (play, skip, volume, queue, help, etc.).
│   ├── events/               — Player-related event handlers (playerStart, error, empty).
│   ├── embeds.js             — UI embeds for now-playing track information.
│   ├── interaction.js        — Player button interaction handler.
│   └── player.js             — Connection connector config and Kazagumo instance manager.
├── events/                   — Client-wide Discord events (messageCreate, ready, guildCreate).
├── utils/                    — Core system utilities.
│   ├── antiSpam.js           — Rolling-window message frequency anti-spam filter.
│   ├── serverLogger.js       — In-server logger manager.
│   ├── globalLogger.js       — Home-server developer log manager.
│   ├── logger.js             — Colorized terminal logging utilities.
│   ├── slashDeploy.js        — Dynamic registration of slash commands.
│   ├── settingsManager.js    — Dynamic manager storing custom log channels and home server configuration.
│   └── voiceCheck.js         — VC presence and music permissions helper.
├── install.bat               — 1-click Windows installer.
└── setup_mac.sh              — Setup script for macOS/Linux environments.
```

---

## 🚀 Getting Started

The installation script configures dependencies locally within this project folder without polluting your system.

### 1. Prerequisites
Ensure you have [Node.js v18 or higher](https://nodejs.org/) installed.

### 2. Setup
Run the setup script matching your operating system:
* **Windows**: Double-click `install.bat`.
* **macOS / Linux**: Run `bash setup_mac.sh` in your terminal.

This installs dependencies and creates your `.env` configuration file.

### 3. Connection Credentials Setup
Open the generated `.env` file and insert your bot details and Lavalink node credentials:
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

## 📖 Complete Documentation
For detailed commands usage, configuration overrides, and advanced options, please refer to the [DOCUMENTATION.md](file:///Users/nusrat/Documents/antigravity/Snax/Snax-Bot/DOCUMENTATION.md) or visit our [online documentation website](https://rainbow-syrniki-02528a.netlify.app/).

---

## 📝 License
Feel free to use, modify, and distribute this codebase for your own Discord servers! Enjoy the music! 🎧
