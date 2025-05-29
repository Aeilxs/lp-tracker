import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

@Injectable()
export class UnregisterCommand {
    constructor(
        private readonly logger: LoggerService,
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
    ) {}

    public readonly data = new SlashCommandBuilder()
        .setName('unregister')
        .setDescription("Unregister a player's account from the server (guild)")
        .addStringOption((o) => o.setName('game_name').setDescription('e. g. Faker').setRequired(true))
        .addStringOption((o) => o.setName('tag_line').setDescription('e. g. #EUW').setRequired(true))
        .addStringOption((o) =>
            o.setName('region').setDescription('euw1, kr1 ...').setRequired(true),
        ) as SlashCommandBuilder;

    async execute(interaction: ChatInputCommandInteraction) {
        const guildId = interaction.guildId;
        if (!guildId) return this.reply(interaction, 'This command can only be used in a server.', true);

        // TODO: fix
        // const member = interaction.member;
        // if (!member || !('permissions' in member) || !member.permissions.has('Administrator')) {
        // }

        const gameName = interaction.options.getString('game_name', true);
        const tagLine = interaction.options.getString('tag_line', true);
        const region = interaction.options.getString('region', true);
    }

    private async reply(interaction: ChatInputCommandInteraction, content: string, ephemeral = false) {
        await interaction.reply({
            content,
            flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        });
    }
}
