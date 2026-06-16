// deactivate.js — Vierry command to deactivate in a channel
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deactivate')
        .setDescription('Deactivate Vierry in this channel'),

    async execute(interaction, client, serverChannels) {
        const guildId = interaction.guild.id;

        if (serverChannels[guildId]) {
            delete serverChannels[guildId];
            await interaction.reply({ content: `❌ Vierry deactivated in this channel.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `⚠️ Vierry is not active in this channel.`, ephemeral: true });
        }
    }
};
