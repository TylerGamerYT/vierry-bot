// vierry.js — Main Vierry Bot (Bot 3)
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
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

// ------------------ CONFIG ------------------
const TOKEN = process.env.TOKEN3;
const MEMORY_FILE = path.join(__dirname, "..", "user_memory.json"); // Pointing back to root
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
let userMemory = {};
let serverChannels = {};
let lastMood = {};

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return;
  try {
    const data = fs.readFileSync(MEMORY_FILE, "utf8");
    if (data) userMemory = JSON.parse(data);
  } catch (err) {
    console.log("Error loading memory:", err);
  }
}

function saveMemory() {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(userMemory, null, 2));
  } catch (err) {
    console.log("Error saving memory:", err);
  }
}

// ------------------ HELPERS ------------------
async function manualResponse() {
  const base =
    miniStories.concat(personaBase)[
      Math.floor(Math.random() * (miniStories.length + personaBase.length))
    ];
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
client.once("ready", async () => {
  console.log(`Vierry (Bot 3) logged in as ${client.user.tag}`);
  loadMemory();
  console.log("Bot is ready and memory loaded!");
});

// ------------------ AUTO CHAT ------------------
setInterval(() => {
  for (const [guildId, channelId] of Object.entries(serverChannels)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    for (let i = 0; i < 3; i++) {
      const msg =
        miniStories.concat(personaBase)[
          Math.floor(Math.random() * (miniStories.length + personaBase.length))
        ];
      const filler =
        Math.random() < 0.5
          ? ""
          : fillers[Math.floor(Math.random() * fillers.length)];
      const emojify =
        Math.random() < 0.4
          ? emojis[Math.floor(Math.random() * emojis.length)]
          : "";
      channel.send(`${msg} ${filler} ${emojify}`.trim());
    }
  }
}, AUTO_CHAT_INTERVAL);

// ------------------ COMMAND HANDLER ------------------
client.commands = new Collection();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction);
});

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
    lastMood[channelId] = mood;
    message.channel.send(mood);
    return;
  }
  if (["why", "why are you", "why r u"].some((x) => content.includes(x))) {
    if (
      lastMood[channelId] &&
      ["bad", "not in the mood"].includes(lastMood[channelId])
    ) {
      const reason =
        moodReasons[Math.floor(Math.random() * moodReasons.length)];
      message.channel.send(reason);
      return;
    }
  }

  for (const [category, answers] of Object.entries(personalityQnA)) {
    if (content.includes(category)) {
      userMemory[userId] = userMemory[userId] || {};
      userMemory[userId][category] =
        answers[Math.floor(Math.random() * answers.length)];
      message.channel.send(userMemory[userId][category]);
      saveMemory();
      return;
    }
  }

  if (message.mentions.has(client.user)) {
    message.channel.send(await manualResponse());
  }
});

client.login(TOKEN);

module.exports = client;
