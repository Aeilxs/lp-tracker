import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { BaseSlashCommand } from './command.base';
import { SlashCommand } from './command.interface';

@Injectable()
export class UnregisterCommand extends BaseSlashCommand implements SlashCommand {
    constructor(
        logger: LoggerService,
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
    ) {
        super(logger);
    }

    public readonly data = new SlashCommandBuilder()
        .setName('unregister')
        .setDescription("Unregister a player's account from the server (guild)")
        .addStringOption((o) => o.setName('game_name').setDescription('e. g. Faker').setRequired(true))
        .addStringOption((o) => o.setName('tag_line').setDescription('e. g. #EUW').setRequired(true))
        .addStringOption((o) =>
            o.setName('region').setDescription('euw1, kr1 ...').setRequired(true),
        ) as SlashCommandBuilder;

    async execute(interaction: ChatInputCommandInteraction) {
        await this.assertInGuild(interaction);
        await this.assertIsAdmin(interaction);

        const gameName = interaction.options.getString('game_name', true);
        const tagLine = interaction.options.getString('tag_line', true);
        const region = interaction.options.getString('region', true);
        const playerToRemove = await this.playerRepo.findOneByGameName(gameName, tagLine, region);

        if (!playerToRemove) {
            return this.reply(
                interaction,
                `Player ${gameName}#${tagLine} (${region}) doesn't exist in our database.`,
                true,
            );
        }

        const guildId = interaction.guildId;
        if (!guildId) {
            return this.reply(interaction, `Error guildId is falsy`);
        }

        await this.guildRepo.removePlayerFromGuild(guildId, playerToRemove.puuid);
        this.loggerService.verbose(`Unregistered ${gameName}#${tagLine} from guild ${guildId}`);

        return this.reply(
            interaction,
            '```ascii\n' +
                `- Removed from tracking: ${gameName}#${tagLine}\n` +
                `- PUUID: ${playerToRemove.puuid}\n` +
                '```',
        );
    }
}
