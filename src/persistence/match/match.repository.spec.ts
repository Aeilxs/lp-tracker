import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { Match, MatchSchema } from './match.schema';
import { MatchRepository } from './match.repository';

describe('MatchRepository', () => {
    let module: TestingModule;
    let repo: MatchRepository;
    let server: MongoMemoryServer;

    const mockMatch: Match = {
        matchId: 'EUW1_123456789',
        gameCreation: Date.now(),
        gameDuration: 1800,
        gameEndTimestamp: Date.now() + 1800000,
        gameMode: 'CLASSIC',
        gameType: 'MATCHED_GAME',
        queueId: 420,
        mapId: 11,
        platformId: 'EUW1',
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
            ],
            providers: [MatchRepository],
        }).compile();

        repo = module.get(MatchRepository);
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

    it('should save and retrieve a match', async () => {
        await repo.save(mockMatch);
        const found = await repo.findOne(mockMatch.matchId);
        expect(found?.queueId).toBe(420);
    });
});
