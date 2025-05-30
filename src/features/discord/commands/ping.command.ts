import { Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { SlashCommand } from './command.interface';

@Injectable()
export class PingCommand implements SlashCommand {
    public readonly data = new SlashCommandBuilder().setName('ping').setDescription("Check the bot's latency");

    async execute(interaction: ChatInputCommandInteraction) {
        const now = Date.now();
        await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
        const diff = Date.now() - now;
        await interaction.followUp({ content: `Latency: \`${diff}ms\``, flags: MessageFlags.Ephemeral });
    }
}
