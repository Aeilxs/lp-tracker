/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Test } from '@nestjs/testing';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { Player } from '@persistence/player/player.schema';
import { InteractionFactory } from '@test-utils/command-interaction-factory.mock';
import { ProfileFactory } from '@test-utils/profile-factory.mock';

import { RegisterCommand } from './register.command';

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
                { provide: RiotService, useValue: { fetchFullPlayerProfile: jest.fn() } },
                { provide: PlayerRepository, useValue: { findOne: jest.fn(), save: jest.fn() } },
                { provide: GuildRepository, useValue: { addPlayerToGuild: jest.fn() } },
            ],
        }).compile();

        command = module.get(RegisterCommand);
        riotService = module.get(RiotService);
        playerRepo = module.get(PlayerRepository);
        guildRepo = module.get(GuildRepository);
        ProfileFactory.resetIdTo(1);
    });

    it('should reply with error if player is not found on Riot API', async () => {
        const interaction = InteractionFactory.createMockInteraction();
        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(null);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('not found'),
            flags: 64,
        });
    });

    it('Should add a player to Guild.puuids if already in database', async () => {
        const interaction = InteractionFactory.builder()
            .withArgs({
                gameName: 'Faker',
                tagLine: 'EUW',
                region: 'euw1',
            })
            .inGuild('guild-1234')
            .build();

        const profileDTO = ProfileFactory.createPlayerProfileDTO({
            account: ProfileFactory.createAccountDTO({ gameName: 'Faker', puuid: 'puuid123' }),
        });

        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(profileDTO);
        const player = Player.fromDto(profileDTO, 'euw1');
        jest.spyOn(playerRepo, 'findOne').mockResolvedValue(player);
        await command.execute(interaction);
        expect(guildRepo.addPlayerToGuild).toHaveBeenCalledWith('guild-1234', 'puuid123');
    });

    it('should save and register new player if not in DB', async () => {
        const interaction = InteractionFactory.builder().inGuild('guild-1234').build();
        const profileDTO = ProfileFactory.createPlayerProfileDTO({
            account: ProfileFactory.createAccountDTO({ gameName: 'Uzi', tagLine: 'EUW', puuid: 'puuid456' }),
        });

        const player = Player.fromDto(profileDTO, 'euw1');

        jest.spyOn(riotService, 'fetchFullPlayerProfile').mockResolvedValue(profileDTO);
        jest.spyOn(playerRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(playerRepo, 'save').mockResolvedValue(player);

        await command.execute(interaction);

        expect(playerRepo.save).toHaveBeenCalled();
        expect(guildRepo.addPlayerToGuild).toHaveBeenCalledWith('guild-1234', 'puuid456');
    });
});
