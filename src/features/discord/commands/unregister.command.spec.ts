import { Test } from '@nestjs/testing';
import { UnregisterCommand } from './unregister.command';
import { LoggerService } from '@logger/logger.service';
import { RiotService } from '@features/riot/riot.service';
import { PlayerRepository } from '@persistence/player/player.repository';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { createMockInteraction } from '../../../test-utils/command-interaction.mock';
import { MessageFlags } from 'discord.js';
import { Player } from '@persistence/player/player.schema';
import { Guild } from '@persistence/guild/guild.schema';

describe('UnregisterCommand', () => {
    let command: UnregisterCommand;
    let playerRepo: PlayerRepository;
    let guildRepo: GuildRepository;

    const mockLogger: Partial<LoggerService> = {
        verbose: jest.fn(),
        error: jest.fn(),
    };

    const mockRiotService: Partial<RiotService> = {};

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UnregisterCommand,
                { provide: LoggerService, useValue: mockLogger },
                {
                    provide: PlayerRepository,
                    useValue: {
                        findOneByGameName: jest.fn(),
                    },
                },
                {
                    provide: GuildRepository,
                    useValue: {
                        findOne: jest.fn(),
                        removePlayerFromGuild: jest.fn(),
                    },
                },
                { provide: RiotService, useValue: mockRiotService },
            ],
        }).compile();

        command = module.get(UnregisterCommand);
        playerRepo = module.get(PlayerRepository);
        guildRepo = module.get(GuildRepository);
    });

    it('should return error if player is not found', async () => {
        const interaction = createMockInteraction();
        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(null);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining("doesn't exist"),
            flags: MessageFlags.Ephemeral,
        });
    });

    it('should return error if guild does not track player', async () => {
        const interaction = createMockInteraction();
        const player: Partial<Player> = { puuid: 'puuid123', gameName: 'sALU LER GA SAVA', tagLine: 'EUW' };
        const guild: Partial<Guild> = { guildId: 'guild123', puuids: [] };

        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(player as Player);
        jest.spyOn(guildRepo, 'findOne').mockResolvedValue(guild as Guild);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('not tracked'),
            flags: MessageFlags.Ephemeral,
        });
    });

    it('should unregister player from guild and confirm', async () => {
        const interaction = createMockInteraction();
        const player: Partial<Player> = { puuid: 'puuid123', gameName: 'Faker', tagLine: 'EUW' };
        const guild: Partial<Guild> = { guildId: 'guild123', puuids: ['puuid123'] };

        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(player as Player);
        jest.spyOn(guildRepo, 'findOne').mockResolvedValue(guild as Guild);
        jest.spyOn(guildRepo, 'removePlayerFromGuild').mockResolvedValue(null);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('Removed from tracking'),
            flags: undefined,
        });
    });
});
