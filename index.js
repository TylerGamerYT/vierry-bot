// index.js — The Entry Point & Command Loader
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { client } = require("./src/vierry");

client.commands = new Collection();

// Dynamically load all JS files in the commands folder
const commandsPath = path.join(__dirname, "src", "commands");
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

console.log("All Vierry commands loaded and bot is ready!");
