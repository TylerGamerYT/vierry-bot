const { SlashCommandBuilder } = require("@discordjs/builders");
// Import the shared state object
const { state } = require("../vierry");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deactivate")
    .setDescription("Deactivate Vierry in this channel"),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    // Access serverChannels through the state object
    if (state.serverChannels[guildId]) {
      delete state.serverChannels[guildId];
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
