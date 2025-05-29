import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { SlashCommand } from './command.interface';
import { LoggerService } from '@logger/logger.service';
import { RiotService } from '@features/riot/riot.service';
import { Player } from '@persistence/player/player.schema';
import { PlayerRepository } from '@persistence/player/player.repository';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { Guild } from '@persistence/guild/guild.schema';

@Injectable()
export class RegisterCommand implements SlashCommand {
    constructor(
        private readonly logger: LoggerService,
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
    ) {}

    public readonly data = new SlashCommandBuilder()
        .setName('register')
        .setDescription("Register a player's account")
        .addStringOption((o) => o.setName('game_name').setDescription('e. g. Faker').setRequired(true))
        .addStringOption((o) => o.setName('tag_line').setDescription('e. g. #EUW').setRequired(true))
        .addStringOption((o) =>
            o.setName('region').setDescription('euw1, kr1 ...').setRequired(true),
        ) as SlashCommandBuilder;

    async execute(interaction: ChatInputCommandInteraction) {
        this.logger.verbose(`RegisterCommand run by ${interaction.user.username} in guild ${interaction.guildId}`);
        const guildId = interaction.guildId;

        if (!guildId) {
            return this.reply(interaction, 'This command can only be used in a server.', true);
        }

        const guild = await this.ensureGuild(guildId, interaction);
        if (!guild) return;

        const [gameName, tagLine, region] = [
            interaction.options.getString('game_name', true),
            interaction.options.getString('tag_line', true),
            interaction.options.getString('region', true),
        ];

        const profile = await this.riotService.fetchFullPlayerProfile(gameName, tagLine, region);
        if (!profile) {
            return this.reply(
                interaction,
                `Player \`${gameName}#${tagLine}\` not found on region **${region}**.`,
                true,
            );
        }

        const existing = await this.playerRepo.findOne(profile.account.puuid);
        if (existing) {
            this.logger.verbose(`Player ${gameName}#${tagLine} already registered in db.`);
            return this.reply(interaction, this.formatResponse(existing, true), true);
        }

        const player = await this.playerRepo.save(Player.fromDto(profile, region));
        if (!player) {
            this.logger.error(`Failed to register player ${gameName}#${tagLine} in region ${region}.`);
            return this.reply(
                interaction,
                `Failed to register player \`${gameName}#${tagLine}\` in region **${region}**.`,
                true,
            );
        }

        if (!guild.puuids.includes(player.puuid)) {
            await this.guildRepo.addPlayerToGuild(guildId, player.puuid);
        }

        await this.reply(interaction, this.formatResponse(player));
    }

    private async ensureGuild(guildId: string, interaction: ChatInputCommandInteraction): Promise<Guild | null> {
        let guild = await this.guildRepo.findOne(guildId);
        if (!guild) {
            guild = await this.guildRepo.save(Guild.fromGuildId(guildId));
            if (!guild) {
                this.logger.error(`Failed to create guild entry for ${guildId}.`);
                await this.reply(interaction, 'Failed to register your guild. Please try again later.', true);
                return null;
            }
        }
        return guild;
    }

    private async reply(interaction: ChatInputCommandInteraction, content: string, ephemeral = false) {
        await interaction.reply({
            content,
            flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        });
    }

    private formatResponse(p: Player, existing = false): string {
        const wr = (w: number, l: number): string => {
            const total = w + l;
            return total === 0 ? 'N/A' : `${((w / total) * 100).toFixed(2)}%`;
        };

        const solo = p.ranked.soloQ;
        const flex = p.ranked.flexQ;

        return (
            '```ascii\n' +
            `- ${existing ? 'Already registered' : 'Tracked player'} ${p.gameName}#${p.tagLine}\n` +
            `- SoloQ: ${solo?.tier ?? 'Unranked'} ${solo?.rank ?? ''} ${solo?.leaguePoints ?? ''} LP ` +
            `(wins: ${solo?.wins ?? 0} losses: ${solo?.losses ?? 0} | wr: ${wr(solo?.wins ?? 0, solo?.losses ?? 0)})\n` +
            `- FlexQ: ${flex?.tier ?? 'Unranked'} ${flex?.rank ?? ''} ${flex?.leaguePoints ?? ''} LP ` +
            `(wins: ${flex?.wins ?? 0} losses: ${flex?.losses ?? 0} | wr: ${wr(flex?.wins ?? 0, flex?.losses ?? 0)})\n` +
            '```'
        );
    }
}
