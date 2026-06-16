// updates.js — Vierry command to show latest updates/news
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("updates")
    .setDescription("Shows the latest Vierry bot updates"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("✨ Vierry Bot Updates")
      .setColor("Blue")
      .setDescription("Here are the latest updates for Vierry!")
      .addFields(
        {
          name: "v1.0",
          value:
            "Initial release of Vierry with fun AI chat and personality Q&A.",
        },
        {
          name: "v1.1",
          value: "Added auto chat, mood detection, and memory features.",
        },
        {
          name: "v2.0",
          value:
            "Major structural overhaul! Moved to a modular src/ directory with organized data/ and command/ folders for cleaner, professional development.",
        },
      )
      .setFooter({ text: "Vierry Bot • Stay playful!" });

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
