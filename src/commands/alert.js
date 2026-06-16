// alert.js — Vierry command to send an alert or ping users
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Send an alert message to the channel')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The alert message to send')
                .setRequired(true)
        ),

    async execute(interaction) {
        const msg = interaction.options.getString('message');

        // Only the bot owner can use this
        if (interaction.user.id !== '1135892597852868690') {
            return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
        }

        await interaction.channel.send(`🚨 **Alert from Vierry:** ${msg}`);
        await interaction.reply({ content: '✅ Alert sent!', ephemeral: true });
    }
};
