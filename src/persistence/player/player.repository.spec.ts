import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Player, PlayerSchema, RankedSnapshot, RankedInfo } from './player.schema';
import { PlayerRepository } from './player.repository';

import mongoose from 'mongoose';
import { QUEUE_TYPE } from '@features/riot/constants';

describe('PlayerRepository', () => {
    let module: TestingModule;
    let repo: PlayerRepository;
    let server: MongoMemoryServer;

    const mockPlayer: Player = {
        puuid: 'abc123',
        gameName: 'Test',
        tagLine: 'EUW',
        summonerId: 'summ123',
        region: 'euw1',
        profileIconId: 123,
        summonerLevel: 55,
        snapshots: [],
        ranked: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const snapshot: RankedSnapshot = {
        matchId: 'EUW1_1234567890',
        timestamp: new Date(),
        queueType: QUEUE_TYPE.RANKED_SOLO_5x5,
        before: {
            tier: 'SILVER',
            rank: 'IV',
            leaguePoints: 80,
            wins: 10,
            losses: 10,
        },
        after: {
            tier: 'SILVER',
            rank: 'IV',
            leaguePoints: 95,
            wins: 11,
            losses: 10,
        },
    };

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
            ],
            providers: [PlayerRepository],
        }).compile();

        repo = module.get(PlayerRepository);
    });

    afterEach(async () => {
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await server.stop();
    });

    /**
     * CRUD operations
     */

    it('should save and retrieve a player', async () => {
        await repo.save(mockPlayer);
        const found = await repo.findOne(mockPlayer.puuid);
        expect(found?.gameName).toBe(mockPlayer.gameName);
    });

    it('should update an existing player', async () => {
        await repo.save(mockPlayer);
        const updatedPlayer = { ...mockPlayer, gameName: 'UpdatedName' };
        const updated = await repo.save(updatedPlayer);
        expect(updated?.gameName).toBe('UpdatedName');
    });

    it('should find all players', async () => {
        await repo.save(mockPlayer);
        const players = await repo.findAll();
        expect(players).toHaveLength(1);
        expect(players[0].gameName).toBe(mockPlayer.gameName);
    });

    it('should delete a player', async () => {
        await repo.save(mockPlayer);
        const deleted = await repo.delete(mockPlayer.puuid);
        expect(deleted?.puuid).toBe(mockPlayer.puuid);
        const found = await repo.findOne(mockPlayer.puuid);
        expect(found).toBeNull();
    });

    it('should return null when deleting a non-existent player', async () => {
        const deleted = await repo.delete('nonExistentPuuid');
        expect(deleted).toBeNull();
    });

    /**
     * Ranked Snapshot operations
     */

    it('should push snapshot and update ranked state', async () => {
        await repo.save(mockPlayer);
        const updated = await repo.pushSnapshotToPlayer(mockPlayer.puuid, snapshot);
        expect(updated).toBeDefined();
        expect(updated?.snapshots).toHaveLength(1);
        expect(updated?.ranked.soloQ?.leaguePoints).toBe(95);
    });

    it('should not add the same snapshot twice', async () => {
        await repo.save(mockPlayer);
        await repo.pushSnapshotToPlayer(mockPlayer.puuid, snapshot);
        const again = await repo.pushSnapshotToPlayer(mockPlayer.puuid, snapshot);
        expect(again).toBeNull();
    });
});
