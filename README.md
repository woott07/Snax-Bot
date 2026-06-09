# 🎵 Snax Music Bot

Welcome to **Snax**! A highly modular, dynamic, and powerful Discord music bot. Built using `discord.js` and `discord-player`, this bot is designed to be fully customizable, easy to maintain, and extremely user-friendly.

---

## ✨ Features

- **Modular Architecture**: Everything is separated into neat little folders. Commands, events, and player logic are all dynamically loaded. No more massive, confusing `index.js` files!
- **Interactive Controller**: Snax doesn't just play music; it spawns a beautiful, interactive embed with buttons (Play, Pause, Skip, Stop) so users can control the queue without typing a single command.
- **Robust Audio Extractors**: Using the latest `@discord-player/extractor`, it grabs high-quality audio efficiently.
- **Queue Management**: Built-in commands to shuffle, clear, loop, and view the current queue.

---

## 📁 Project Structure

Here's a quick look at how the bot is organized:

```text
Snax/
├── config/           # Configuration files (config.json) and env wrappers
├── commands/         # All text commands ($play, $skip, $volume, etc.)
├── events/           # Standard Discord client events (ready, messageCreate)
├── playerEvents/     # Audio player events (playerStart, emptyQueue)
├── embeds/           # UI elements and Embed builders
├── handlers/         # Dynamic loaders that bootstrap commands and events
├── services/         # Core business logic and audio abstractions
├── utils/            # Helper scripts (like voiceCheck and the custom logger)
├── data/             # Local storage for settings and playlists
└── index.js          # The incredibly lightweight entry point!
```

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16.9.0 or higher is recommended for discord.js v14).

### 2. Installation
Clone or download this repository to your local machine, then install the required dependencies:

```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your bot's secret credentials. It should look like this:

```env
Bot_Token=YOUR_DISCORD_BOT_TOKEN_HERE
```
*(Make sure you never share your token publicly!)*

### 4. Configuration
You can tweak the bot's behavior in `config/config.json`. Here you can change the default prefix, embed colors, volume, and permissions!

```json
{
    "prefix": "$",
    "defaultVolume": 100,
    "embed": {
        "color": "#2b2d31",
        "showThumbnail": true
    }
}
```

### 5. Run the Bot
Once everything is set up, fire up the bot using:

```bash
node index.js
```
You should see a series of success messages in your terminal indicating that commands and events have loaded, followed by `🤖 Success! Logged in as YourBotName`.

---

## 🛠️ Adding New Commands

Want to add a new feature? It's incredibly easy! 
Just create a new file in the `commands/` folder. Snax will automatically detect it and load it the next time it starts.

Example `commands/ping.js`:
```javascript
module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    execute: async (message, args, client, player, config) => {
        message.reply('🏓 Pong!');
    }
};
```

---

## 📝 License
Feel free to use, modify, and distribute this codebase for your own Discord servers! Enjoy the music! 🎧
