// vierry.js — Main Vierry Bot
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
const { state } = require("./data/state");

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
client.once("ready", async () => {
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
});

// ------------------ AUTO CHAT ------------------
setInterval(async () => {
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
