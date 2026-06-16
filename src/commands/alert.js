const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("alert")
    .setDescription("Send an alert message to the channel")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The alert message to send")
        .setRequired(true),
    ),

  async execute(interaction) {
    // Owner check
    if (interaction.user.id !== "1135892597852868690") {
      return interaction.reply({
        content: "❌ You are not allowed to use this command.",
        ephemeral: true,
      });
    }

    const msg = interaction.options.getString("message");

    // Acknowledge the command first so it doesn't fail
    await interaction.reply({ content: "✅ Alert sent!", ephemeral: true });

    // Use followUp to send the actual message to the channel
    await interaction.channel.send(`🚨 **Alert from Vierry:** ${msg}`);
  },
};
