/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Test } from '@nestjs/testing';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { Guild } from '@persistence/guild/guild.schema';
import { PlayerRepository } from '@persistence/player/player.repository';
import { Player } from '@persistence/player/player.schema';
import { InteractionFactory } from '@test-utils/command-interaction-factory.mock';
import { ProfileFactory } from '@test-utils/profile-factory.mock';
import { MessageFlags } from 'discord.js';

import { UnregisterCommand } from './unregister.command';

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
        expect(true).toBe(true);
        const interaction = InteractionFactory.createMockInteraction();

        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(null);
        await command.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining("doesn't exist"),
            flags: MessageFlags.Ephemeral,
        });
    });

    it('should return error if guild does not track player', async () => {
        const interaction = InteractionFactory.builder()
            .withArgs({
                gameName: 'Faker',
                tagLine: 'EUW',
                region: 'euw1',
            })
            .inGuild('123')
            .build();
        const guild: Guild = { guildId: '123', puuids: ['456'] };
        const player = Player.fromDto(
            ProfileFactory.createPlayerProfileDTO({
                account: ProfileFactory.createAccountDTO({ puuid: 'not456' }),
            }),
            'euw1',
        );

        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(player);
        jest.spyOn(guildRepo, 'findOne').mockResolvedValue(guild);

        await command.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('not tracked'),
            flags: MessageFlags.Ephemeral,
        });
    });

    it('should unregister player from guild and confirm', async () => {
        const interaction = InteractionFactory.builder()
            .withArgs({
                gameName: 'whizizi',
                tagLine: 'euw',
                region: 'euw1',
            })
            .inGuild('123')
            .build();
        const player = Player.fromDto(
            ProfileFactory.createPlayerProfileDTO({
                account: ProfileFactory.createAccountDTO({ puuid: '456' }),
            }),
            'euw1',
        );
        const guild: Guild = { guildId: '123', puuids: ['456'] };
        jest.spyOn(playerRepo, 'findOneByGameName').mockResolvedValue(player);
        jest.spyOn(guildRepo, 'findOne').mockResolvedValue(guild);

        await command.execute(interaction);

        expect(jest.spyOn(guildRepo, 'removePlayerFromGuild')).toHaveBeenCalledWith('123', '456');

        expect(interaction.reply).toHaveBeenCalledWith({
            content: expect.stringContaining('Removed from tracking'),
            flags: undefined,
        });
    });

    it('should return an error if user is not admin', async () => {
        const interaction = InteractionFactory.builder()
            .withArgs({
                gameName: 'whizizi',
                tagLine: 'euw',
                region: 'euw1',
            })
            .inGuild('123')
            .nonAdmin()
            .build();

        await expect(command.execute(interaction)).rejects.toThrow('Not an admin');
    });
});
