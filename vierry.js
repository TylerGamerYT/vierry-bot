// vierry.js — Main Vierry Bot (Bot 3)
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ------------------ CONFIG ------------------
const TOKEN = process.env.TOKEN3; // Vierry Bot token
const MEMORY_FILE = path.join(__dirname, 'user_memory.json');
const AUTO_CHAT_INTERVAL = 5000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// ------------------ MEMORY ------------------
let userMemory = {};
let serverChannels = {};
let lastMood = {};

function loadMemory() {
    if (!fs.existsSync(MEMORY_FILE)) return;
    try {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        if (data) userMemory = JSON.parse(data);
    } catch (err) { console.log('Error loading memory:', err); }
}

function saveMemory() {
    try { fs.writeFileSync(MEMORY_FILE, JSON.stringify(userMemory, null, 2)); }
    catch (err) { console.log('Error saving memory:', err); }
}

// ------------------ DATA ------------------
const personaBase = [
    "hai","wdym?","who's looking hot?","lmao u wild","ohhh snap","hehe don't test me","yooo what’s the tea",
    "u think u slick?","what's poppin?","srsly tho","lol u crazy","wait what?","yikes","hehehe","omg stop it",
    "fr fr","no way","huh??","ahhh ok","sup fam","omg really?","lmao bruh","yooo check this","heyyy what's good?",
    "you wildin'","ohhh nooo","haha lol"
];
const miniStories = [
    "soooo… I was walking in the park and a squirrel stared at me like wtf lol",
    "omg y’all won’t believe it I spilled coffee on my keyboard now it types by itself",
    "I just tried to cook… almost set the kitchen on fire",
    "Listening to anime openings and dancing like crazy",
    "I accidentally sent a text to the wrong person",
    "My cat is sitting on my keyboard again"
];
const fillers = ["uhh…","hmm…","lol","haha","*sigh*","*eyeroll*","hehe","omg","tsk tsk","yikes","wooow","huh?","ahh","eh?","heh","uh oh","hmph","meh","*shrugs*","*sighs*","tsk","yay","ugh","*giggles*","*smiles*","*blushes*","heheh","hm..."];
const emojis = ["😂","😏","🙃","😎","🤯","👀","😼","✨","🥴","😹","😳","😤","🔥","🤭","🥳","😝"];
const moodResponses = ["good","ok","bad","not in the mood","chill","excited","bored","sassy"];
const moodReasons = [
    "I spilled coffee on my keyboard","Someone ate my favorite snack","I didn't sleep well last night",
    "Just feeling a bit lazy today","Mondays, you know…","Thinking about anime plot twists",
    "I lost in a game","The Wi-Fi was acting up","My cat stole my chair","Missed my breakfast","Anime ended"
];
const personalityQnA = {
    age:["I'm currently 17","I'm 17 wbu?","Still 17!","Forever 17"],
    hobby:["I love drawing anime!","Gaming is my thing","Chatting with friends","I cosplay sometimes"],
    fav_color:["Purple"],
    food:["I love sushi","Pizza is my fav","Ice cream forever","Chocolate is life","Ramen is love"],
    music:["I love anime soundtracks","K-pop is fun","Lo-fi beats are chill","EDM gets me hyped","Pop songs make me dance"],
    anime:["I love Naruto","Attack on Titan is epic","Demon Slayer is amazing","My Hero Academia is fire"],
    movie:["I like Studio Ghibli movies","Marvel is fun too","Animated movies are the best","Rom-coms are cute"],
    color:["Purple"],
    mood:["Feeling great today","Just chilling","Not in the mood","A bit tired","Excited","Bored","Sassy","Happy"]
};

// ------------------ HELPERS ------------------
async function manualResponse() {
    const base = miniStories.concat(personaBase)[Math.floor(Math.random() * (miniStories.length + personaBase.length))];
    const filler = Math.random() < 0.5 ? "" : fillers[Math.floor(Math.random() * fillers.length)];
    const emojify = Math.random() < 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : "";
    return `${base} ${filler} ${emojify}`.trim();
}

// ------------------ EVENTS ------------------
client.once('ready', async () => {
    console.log(`Vierry (Bot 3) logged in as ${client.user.tag}`);
    loadMemory();
    console.log('Bot is ready and memory loaded!');
});

// ------------------ AUTO CHAT ------------------
setInterval(() => {
    for (const [guildId, channelId] of Object.entries(serverChannels)) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const channel = guild.channels.cache.get(channelId);
        if (!channel) continue;
        for (let i = 0; i < 3; i++) {
            const msg = miniStories.concat(personaBase)[Math.floor(Math.random() * (miniStories.length + personaBase.length))];
            const filler = Math.random() < 0.5 ? "" : fillers[Math.floor(Math.random() * fillers.length)];
            const emojify = Math.random() < 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : "";
            channel.send(`${msg} ${filler} ${emojify}`.trim());
        }
    }
}, AUTO_CHAT_INTERVAL);

// ------------------ COMMAND HANDLER ------------------
client.commands = new Collection();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = client.commands.get(interaction.commandName);
    if (cmd) await cmd.execute(interaction);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();
    const userId = message.author.id;
    const channelId = message.channel.id;

    // Mood detection
    if (["hru","how are you","how r u","how's it going"].some(x => content.includes(x))) {
        const mood = moodResponses[Math.floor(Math.random() * moodResponses.length)];
        lastMood[channelId] = mood;
        message.channel.send(mood);
        return;
    }
    if (["why","why are you","why r u"].some(x => content.includes(x))) {
        if (lastMood[channelId] && ["bad","not in the mood"].includes(lastMood[channelId])) {
            const reason = moodReasons[Math.floor(Math.random() * moodReasons.length)];
            message.channel.send(reason);
            return;
        }
    }

    // Personality Q&A + memory
    for (const [category, answers] of Object.entries(personalityQnA)) {
        if (content.includes(category)) {
            userMemory[userId] = userMemory[userId] || {};
            userMemory[userId][category] = answers[Math.floor(Math.random() * answers.length)];
            message.channel.send(userMemory[userId][category]);
            saveMemory();
            return;
        }
    }

    // Manual response if mentioned
    if (message.mentions.has(client.user)) {
        message.channel.send(await manualResponse());
    }
});

// ------------------ LOGIN ------------------
client.login(TOKEN);

module.exports = client;
