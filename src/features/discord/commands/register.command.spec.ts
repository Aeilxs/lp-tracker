import { Test } from '@nestjs/testing';
import { RegisterCommand } from './register.command';
import { LoggerService } from '@logger/logger.service';
import { RiotService } from '@features/riot/riot.service';
import { PlayerRepository } from '@persistence/player/player.repository';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { createMockInteraction } from '../../../test-utils/command-interaction.mock';
import { Player } from '@persistence/player/player.schema';
import { PlayerProfileDTO } from '@features/riot/dtos';

describe('RegisterCommand', () => {
    let command: RegisterCommand;
    let riotService: RiotService;
    let playerRepo: PlayerRepository;
    let guildRepo: GuildRepository;

    const mockLogger: Partial<LoggerService> = {
        verbose: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                RegisterCommand,
                { provide: LoggerService, useValue: mockLogger },
                {
                    provide: RiotService,
                    useValue: {
                        fetchFullPlayerProfile: jest.fn(),
                    },
                },
                {
                    provide: PlayerRepository,
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: GuildRepository,
                    useValue: {
                        addPlayerToGuild: jest.fn(),
                    },
                },
            ],
        }).compile();

        command = module.get(RegisterCommand);
        riotService = module.get(RiotService);
        playerRepo = module.get(PlayerRepository);
        guildRepo = module.get(GuildRepository);
    });

    it('should reply with error if player is not found on Riot API', async () => {
        const interaction = createMockInteraction();
        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(null);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('not found'),
            flags: 64,
        });
    });

    it('should add player to guild if already in DB', async () => {
        const interaction = createMockInteraction();
        const profile: Partial<PlayerProfileDTO> = {
            account: { puuid: 'puuid123', gameName: 'Faker', tagLine: 'EUW' },
            ranked: {
                soloQ: null,
                flexQ: null,
            },
        };
        const player = { ...profile, region: 'euw1' };

        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(profile as PlayerProfileDTO);
        jest.spyOn(playerRepo, 'findOne').mockResolvedValue(player as unknown as Player);

        await command.execute(interaction);

        expect(guildRepo.addPlayerToGuild).toHaveBeenCalledWith('guild123', 'puuid123');
        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('Already registered'),
        });
    });

    it('should save and register new player if not in DB', async () => {
        const interaction = createMockInteraction();
        const profile: Partial<PlayerProfileDTO> = {
            account: {
                puuid: 'puuid456',
                gameName: 'Faker',
                tagLine: 'EUW',
            },
            summoner: {
                id: 'summoner456',
                profileIconId: 123,
                summonerLevel: 99,
            },
            ranked: {
                soloQ: { tier: 'GOLD', rank: 'II', leaguePoints: 50, wins: 20, losses: 10 },
                flexQ: { tier: 'SILVER', rank: 'I', leaguePoints: 75, wins: 15, losses: 5 },
            },
        };

        const player = Player.fromDto(profile, 'euw1');

        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(profile);
        jest.spyOn(playerRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(playerRepo, 'save').mockResolvedValue(player);

        await command.execute(interaction);

        expect(playerRepo.save).toHaveBeenCalled();
        expect(guildRepo.addPlayerToGuild).toHaveBeenCalledWith('guild123', 'puuid456');
        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('Tracked player'),
        });
    });
});
