// index.js — Vierry command loader
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Now pointing to the new location in src/
const vierry = require("./src/vierry");

// Now pointing to the new location in src/commands/
const commandsPath = path.join(__dirname, "src", "commands");

// Dynamically load all JS files in the commands folder
fs.readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const command = require(path.join(commandsPath, file));
    // Assuming your command files export a 'data' object with a 'name' property
    vierry.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  });

console.log("All Vierry commands loaded!");
