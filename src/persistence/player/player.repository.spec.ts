import { QUEUE_TYPE } from '@features/riot/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { PlayerRepository } from './player.repository';
import { Player, PlayerSchema, RankedSnapshot } from './player.schema';

describe('PlayerRepository', () => {
    let module: TestingModule;
    let repo: PlayerRepository;
    let mongod: MongoMemoryServer;

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
        matchId: 'match1',
        queueType: QUEUE_TYPE.RANKED_SOLO_5x5,
        timestamp: new Date(),
        snapshot: {
            tier: 'GOLD',
            rank: 'I',
            leaguePoints: 55,
            wins: 10,
            losses: 5,
        },
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
            ],
            providers: [PlayerRepository],
        }).compile();

        repo = module.get(PlayerRepository);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db?.dropDatabase();
    });

    it('should insert and retrieve a player with puuid', async () => {
        const inserted = await repo.save(mockPlayer);
        const found = await repo.findOne(mockPlayer.puuid);

        expect(inserted).toBeDefined();
        expect(found).toBeDefined();
        expect(found!.puuid).toBe(mockPlayer.puuid);
    });

    it('should retrieve a player with his gameName#tagLine and region', async () => {
        const inserted = await repo.save(mockPlayer);
        const found = await repo.findOneByGameName(mockPlayer.gameName, mockPlayer.tagLine, mockPlayer.region);

        expect(inserted).toBeDefined();
        expect(found).toBeDefined();
        expect(found!.puuid).toBe(mockPlayer.puuid);
    });

    it('should add a ranked snapshot', async () => {
        await repo.save(mockPlayer);

        await repo.addSnapshot(mockPlayer.puuid, snapshot);
        const updated = await repo.findOne(mockPlayer.puuid);

        expect(updated?.snapshots).toHaveLength(1);
        expect(updated?.snapshots[0].snapshot.tier).toBe('GOLD');
        expect(updated?.snapshots[0].queueType).toBe(QUEUE_TYPE.RANKED_SOLO_5x5);
    });
});
