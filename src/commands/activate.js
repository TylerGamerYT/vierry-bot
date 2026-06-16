const { SlashCommandBuilder } = require("@discordjs/builders");
// Import the shared state from the main file
const { state } = require("../vierry");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("activate")
    .setDescription("Activate Vierry in this channel"),

  async execute(interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    // Now this will correctly update the object
    state.serverChannels[guildId] = channelId;

    await interaction.reply({
      content: `✅ Vierry activated in <#${channelId}>!`,
      ephemeral: true,
    });
  },
};
