const { SlashCommandBuilder } = require("@discordjs/builders");
const { AttachmentBuilder } = require("discord.js");
const OpenAI = require("openai");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an image using AI")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Describe the image you want")
        .setRequired(true),
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const OPENAI_KEY = process.env.OPENAI_KEY;

    if (!OPENAI_KEY) {
      return interaction.reply({
        content: "❌ OpenAI key not set, AI disabled.",
        ephemeral: true,
      });
    }

    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    // Defer so the user sees a "loading" state instead of an error while the AI works
    await interaction.deferReply();

    try {
      const response = await openai.images.generate({
        model: "dall-e-3", // Use 'dall-e-3' or 'dall-e-2'
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data[0].url;
      const attachment = new AttachmentBuilder(imageUrl);

      await interaction.editReply({
        content: `🖼️ Image for: **${prompt}**`,
        files: [attachment],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply(
        "❌ Failed to generate image. The AI might be busy or the prompt was blocked.",
      );
    }
  },
};
