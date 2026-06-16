const { SlashCommandBuilder } = require("@discordjs/builders");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an image using AI (OpenAI or Gemini)")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Describe the image you want")
        .setRequired(true),
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const OPENAI_KEY = process.env.OPENAI_KEY;
    const GEMINI_KEY = process.env.GEMINI_KEY;

    // 1. Guard check if neither key is available
    if (!OPENAI_KEY && !GEMINI_KEY) {
      return interaction.reply({
        content: "❌ Neither OpenAI nor Gemini API keys are set. AI disabled.",
        ephemeral: true,
      });
    }

    // Defer reply immediately so Discord gives the AI time to generate
    await interaction.deferReply();

    let attachment;
    let statusNotice = "";

    try {
      if (OPENAI_KEY) {
        // --- OPENAI MODE ---
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: OPENAI_KEY });

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });

        const imageUrl = response.data[0].url;
        attachment = new AttachmentBuilder(imageUrl, {
          name: "openai_image.png",
        });
      } else {
        // --- GEMINI FALLBACK MODE ---
        statusNotice = "⚠️ **OpenAI key not set, Gemini enabled.**\n\n";

        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

        const response = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
          },
        });

        // Convert base64 string from Gemini API into a usable buffer for Discord
        const base64Image = response.generatedImages[0].image.imageBytes;
        const buffer = Buffer.from(base64Image, "base64");
        attachment = new AttachmentBuilder(buffer, {
          name: "gemini_image.jpg",
        });
      }

      // Deliver the final generated asset with the dynamic status text
      await interaction.editReply({
        content: `${statusNotice}🎨 Here is your image for: *"${prompt}"*`,
        files: [attachment],
      });
    } catch (error) {
      console.error("Image generation error:", error);
      await interaction.editReply({
        content: `❌ Failed to generate image: ${error.message}`,
      });
    }
  },
};
