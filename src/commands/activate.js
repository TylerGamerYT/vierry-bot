// src/commands/activate.js
const { SlashCommandBuilder } = require("@discordjs/builders");
// We need to bring in the bot instance to access its internal variables
const vierry = require("../vierry");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("activate")
    .setDescription("Activate Vierry in this channel"),

  async execute(interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    // Access the serverChannels object directly from the vierry module
    // Note: You need to make serverChannels exportable in vierry.js
    vierry.serverChannels[guildId] = channelId;

    await interaction.reply({
      content: `✅ Vierry activated in <#${channelId}>!`,
      ephemeral: true,
    });
  },
};
