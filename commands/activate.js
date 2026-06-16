// activate.js — Vierry command to activate in a channel
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activate')
        .setDescription('Activate Vierry in this channel'),

    async execute(interaction, client, serverChannels) {
        const channelId = interaction.channel.id;
        const guildId = interaction.guild.id;

        serverChannels[guildId] = channelId;
        await interaction.reply({ content: `✅ Vierry activated in <#${channelId}>!`, ephemeral: true });
    }
};
