// index.js — Vierry command loader
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const vierry = require('./vierry'); // Main Vierry bot file (vierry.js)

// Path to the commands folder inside the Vierry folder
const commandsPath = path.join(__dirname, 'commands');

// Dynamically load all JS files in the commands folder
fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(path.join(commandsPath, file));
    vierry.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  });

console.log('All Vierry commands loaded!');
