const { SlashCommandBuilder } = require("@discordjs/builders");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an image using AI (OpenAI or Stable Diffusion)")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Describe the image you want")
        .setRequired(true),
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const OPENAI_KEY = process.env.OPENAI_KEY;
    const HF_KEY = process.env.HF_KEY;

    // Guard: Check if neither key is available
    if (!OPENAI_KEY && !HF_KEY) {
      return interaction.reply({
        content:
          "❌ Neither OpenAI nor Hugging Face API keys are set. AI disabled.",
        ephemeral: true,
      });
    }

    // Defer reply immediately so Discord gives the bot time to generate
    await interaction.deferReply();

    let attachment;
    let statusNotice = "";

    try {
      if (OPENAI_KEY) {
        // --- OPENAI MODE ---
        statusNotice = "ℹ️ **Generating with OpenAI DALL-E 3.**\n\n";

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
        // --- HUGGING FACE SDK MODE ---
        statusNotice =
          "⚠️ **OpenAI key not set, using Free (Stable Diffusion XL) model.**\n\n";

        // Use the official SDK to prevent "fetch failed" socket drops
        const { HfInference } = require("@huggingface/inference");
        const hf = new HfInference(HF_KEY);

        // We use stable-diffusion-xl-base-1.0 because it's fast, free, and completely un-gated
        const imageBlob = await hf.textToImage({
          model: "stabilityai/stable-diffusion-xl-base-1.0",
          inputs: prompt,
          parameters: {
            negative_prompt: "blurry, bad quality, distorted",
          },
        });

        // Convert the SDK blob directly into a Node buffer for Discord
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        attachment = new AttachmentBuilder(buffer, {
          name: "stable_diffusion_image.jpg",
        });
      }

      // Deliver final asset
      await interaction.editReply({
        content: `${statusNotice}🎨 Here is your free image for: *"${prompt}"*`,
        files: [attachment],
      });
    } catch (error) {
      console.error("Image generation crash:", error);

      // Handle the common Hugging Face free-tier loading state gracefully
      if (error.message.includes("503") || error.message.includes("loading")) {
        return interaction.editReply({
          content:
            "⏳ **Free Service Notice:** The generation model is currently warming up on Hugging Face's servers. Please wait 15 seconds and try your prompt again!",
        });
      }

      await interaction.editReply({
        content: `❌ Generation crashed: ${error.message}`,
      });
    }
  },
};
