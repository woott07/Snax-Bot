# 🎵 Snax Music Bot

Welcome to **Snax**! A highly modular, dynamic, and powerful Discord music bot. Built using `discord.js` and `discord-player`, this bot is designed to be fully customizable, easy to maintain, and extremely user-friendly.

> ⚠️ **Note**: Still under work, feel free to use it!

---

## 🔗 Invite Snax to Your Server!
[Click here to invite the bot!](https://discord.com/oauth2/authorize?client_id=1479181184696193154&permissions=8&integration_type=0&scope=bot+applications.commands)

---

## ✨ Features

- **Modular Architecture**: Everything is separated into neat little folders. Commands, events, and player logic are all dynamically loaded. No more massive, confusing `index.js` files!
- **Ultra-Clean Interactive Embeds**: When you play a song, Snax sends a clean UI with the song's thumbnail and **Interactive Buttons** (`Remove`, `Push to Top`, `Keep`). These buttons auto-dismiss when a new song is added to keep your chat clean.
- **Robust Audio Extractors**: Using the latest extraction bridges (`play-dl`, `youtube-ext`) with `highestaudio` quality enforced, ensuring crystal-clear, glitch-free audio playback.
- **Private Automated Logging**: Automatically creates a secure `snax-log` channel in your server where only Admins and the bot can read/write logs.
- **Queue Management**: Built-in commands to `play`, `skip`, `volume`, `remove` (by name), `queue`, and much more! (Prefix is fully customizable in config.json, defaults to `$`)

---

## 📁 Project Structure

Here's a quick look at how the bot is organized:

```text
Snax/
├── config/           # Configuration files (config.json) and env wrappers
├── commands/         # All text commands (play, skip, remove, etc.)
├── events/           # Standard Discord client events (ready, messageCreate)
├── playerEvents/     # Audio player events (playerStart, emptyQueue)
├── embeds/           # UI elements and Embed builders
├── handlers/         # Dynamic loaders that bootstrap commands and events
├── services/         # Core business logic and audio abstractions
├── utils/            # Helper scripts (like voiceCheck and serverLogger)
├── install.bat       # 1-Click safe installer for Windows
└── index.js          # The incredibly lightweight entry point!
```

---

## 🚀 Getting Started (Safe Installation)

Safety is our 1st priority! The installation process restricts everything to this specific folder. It **will not** install anything globally or mess with your device's core files.

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Quick Setup (Recommended)
If you pulled this code from Git or downloaded it, setup is 100% automated:
- Simply double-click the `install.bat` file.
- It will safely download all required packages into this folder ONLY.
- It will **automatically create** your `.env` and `.gitignore` files.

### 3. Add Your Token
Since `install.bat` created the `.env` file for you, just open it in any text editor and paste your bot token:
```env
Bot_Token=YOUR_DISCORD_BOT_TOKEN_HERE
```
*(Make sure you never share your token publicly!)*

### 4. Configuration
You can tweak the bot's behavior in `config/config.json`. Change the default prefix, embed colors, default volume, etc.

### 5. Run the Bot
Once setup is complete, you can start the bot using your terminal:

```bash
node index.js
```
You should see a series of success messages in your terminal indicating that the extractors and commands have loaded, followed by `🤖 Success! Logged in as YourBotName`.

---

## 🛠️ Adding New Commands

Want to add a new feature? It's incredibly easy! 
Just create a new file in the `commands/` folder. Snax will automatically detect it and load it the next time it starts.

---

## 📝 License
Feel free to use, modify, and distribute this codebase for your own Discord servers! Enjoy the music! 🎧
