// vierry.js — Main Vierry Bot
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const {
  personaBase,
  miniStories,
  fillers,
  emojis,
  moodResponses,
  moodReasons,
  personalityQnA,
} = require("./data/personas");

// Import the exported object directly
const state = require("./data/state");

// --- CHANNEL PERSISTENCE (Prevents forgetting channels on restart) ---
const CHANNELS_FILE = path.join(__dirname, "..", "active_channels.json");

// 1. Load saved channels from disk immediately on startup
if (fs.existsSync(CHANNELS_FILE)) {
  try {
    const data = fs.readFileSync(CHANNELS_FILE, "utf8");
    if (data) Object.assign(state.serverChannels, JSON.parse(data));
  } catch (err) {
    console.error("Error loading saved channels:", err);
  }
}

// 2. Proxy Watcher: Automatically writes to disk when commands modify state.serverChannels
state.serverChannels = new Proxy(state.serverChannels, {
  set(target, prop, value) {
    target[prop] = value;
    try {
      fs.writeFileSync(CHANNELS_FILE, JSON.stringify(target, null, 2));
    } catch (err) {
      console.error("Error saving channels configuration:", err);
    }
    return true;
  },
  deleteProperty(target, prop) {
    delete target[prop];
    try {
      fs.writeFileSync(CHANNELS_FILE, JSON.stringify(target, null, 2));
    } catch (err) {
      console.error("Error saving channels configuration:", err);
    }
    return true;
  },
});

// ------------------ CONFIG ------------------
const TOKEN = process.env.TOKEN3;
const MEMORY_FILE = path.join(__dirname, "..", "user_memory.json");
const AUTO_CHAT_INTERVAL = 5000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

// ------------------ MEMORY ------------------
function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return;
  try {
    const data = fs.readFileSync(MEMORY_FILE, "utf8");
    if (data) state.userMemory = JSON.parse(data);
  } catch (err) {
    console.error("Error loading memory:", err);
  }
}

function saveMemory() {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(state.userMemory, null, 2));
  } catch (err) {
    console.error("Error saving memory:", err);
  }
}

// ------------------ HELPERS ------------------
async function manualResponse() {
  const allMsgs = miniStories.concat(personaBase);
  const base = allMsgs[Math.floor(Math.random() * allMsgs.length)];
  const filler =
    Math.random() < 0.5
      ? ""
      : fillers[Math.floor(Math.random() * fillers.length)];
  const emojify =
    Math.random() < 0.4
      ? emojis[Math.floor(Math.random() * emojis.length)]
      : "";
  return `${base} ${filler} ${emojify}`.trim();
}

// ------------------ EVENTS ------------------
client.once("clientReady", async () => {
  console.log(`Vierry logged in as ${client.user.tag}`);
  loadMemory();

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    }
  }
  console.log("Bot is ready and commands loaded!");

  // --- SYSTEM LOG EMITTER ---
  const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
  if (LOG_CHANNEL_ID) {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) {
      const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2,
      );
      const serverCount = client.guilds.cache.size;
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const logEmbed = new EmbedBuilder()
        .setColor("#7252a1")
        .setAuthor({
          name: "System Notification",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle("🚀 Deployment Successful")
        .setDescription(
          `The bot \`${client.user.tag}\` has successfully bypassed the gateway and is now active.`,
        )
        .addFields(
          { name: "🔌 Mode", value: "`Global / User-App`", inline: true },
          { name: "🟢 Health", value: "`Operational`", inline: true },
          {
            name: "📁 Scripts",
            value: `\`${client.commands.size} Modules\``,
            inline: true,
          },
          {
            name: "🌐 Network",
            value: `\`Connected to ${serverCount} Server${serverCount === 1 ? "" : "s"}\``,
            inline: true,
          },
          { name: "🧠 Memory", value: `\`${memoryUsed} MB\``, inline: true },
          {
            name: "🔗 Quick Links",
            value: `[Invite Me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`,
            inline: false,
          },
        )
        .setFooter({
          text: `Vierry v2.5 • System Integrity Verified • Today at ${currentTime}`,
        });

      await logChannel
        .send({ embeds: [logEmbed] })
        .catch((err) => console.error("Failed sending startup log:", err));
    } else {
      console.warn(
        `System Logger: Channel ID ${LOG_CHANNEL_ID} was not found in cache.`,
      );
    }
  }
});

// ------------------ AUTO CHAT ------------------
setInterval(async () => {
  if (!state.serverChannels) return;
  for (const [guildId, channelId] of Object.entries(state.serverChannels)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    for (let i = 0; i < 3; i++) {
      const msg = await manualResponse();
      channel.send(msg);
    }
  }
}, AUTO_CHAT_INTERVAL);

// ------------------ COMMAND HANDLER ------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction, state);
});

// ------------------ MESSAGE HANDLER ------------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase();
  const userId = message.author.id;
  const channelId = message.channel.id;

  if (
    ["hru", "how are you", "how r u", "how's it going"].some((x) =>
      content.includes(x),
    )
  ) {
    const mood =
      moodResponses[Math.floor(Math.random() * moodResponses.length)];
    state.lastMood[channelId] = mood;
    message.channel.send(mood);
    return;
  }

  if (["why", "why are you", "why r u"].some((x) => content.includes(x))) {
    if (
      state.lastMood[channelId] &&
      ["bad", "not in the mood"].includes(state.lastMood[channelId])
    ) {
      const reason =
        moodReasons[Math.floor(Math.random() * moodReasons.length)];
      message.channel.send(reason);
      return;
    }
  }

  for (const [category, answers] of Object.entries(personalityQnA)) {
    if (content.includes(category)) {
      state.userMemory[userId] = state.userMemory[userId] || {};
      state.userMemory[userId][category] =
        answers[Math.floor(Math.random() * answers.length)];
      message.channel.send(state.userMemory[userId][category]);
      saveMemory();
      return;
    }
  }

  if (message.mentions.has(client.user)) {
    message.channel.send(await manualResponse());
  }
});

client.login(TOKEN);
module.exports = { client, state };
