// src/commands/deactivate.js
const { SlashCommandBuilder } = require("@discordjs/builders");
// Import the shared object directly from your main file
const { serverChannels } = require("../vierry");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deactivate")
    .setDescription("Deactivate Vierry in this channel"),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    if (serverChannels[guildId]) {
      delete serverChannels[guildId];
      await interaction.reply({
        content: `❌ Vierry deactivated in this channel.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `⚠️ Vierry is not active in this channel.`,
        ephemeral: true,
      });
    }
  },
};
