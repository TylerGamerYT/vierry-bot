// image.js — Vierry AI image command
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const OpenAI = require('openai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate an image using AI')
        .addStringOption(option => 
            option.setName('prompt')
                .setDescription('Describe the image you want')
                .setRequired(true)
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const OPENAI_KEY = process.env.OPENAI_KEY;

        if (!OPENAI_KEY) {
            return interaction.reply({ content: "❌ OpenAI key not set, AI disabled.", ephemeral: true });
        }

        const openai = new OpenAI({ apiKey: OPENAI_KEY });

        await interaction.deferReply();

        try {
            const result = await openai.images.generate({
                model: 'gpt-image-1',
                prompt: prompt,
                size: '512x512'
            });

            const imageUrl = result.data[0].url;
            const attachment = new AttachmentBuilder(imageUrl);

            await interaction.editReply({ content: `🖼️ Image for: **${prompt}**`, files: [attachment] });
        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Failed to generate image.");
        }
    }
};
