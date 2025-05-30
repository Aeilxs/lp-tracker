import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { MatchRepository } from './match.repository';
import { Match, MatchSchema } from './match.schema';

describe('MatchRepository', () => {
    let module: TestingModule;
    let repo: MatchRepository;
    let server: MongoMemoryServer;

    const mockData = {
        info: { gameId: 12345, participants: [] },
        metadata: { matchId: 'EUW1_123456789', participants: ['puuid1'] },
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

    it('should save and retrieve a raw match', async () => {
        const matchId = 'EUW1_123456789';
        const region = 'euw1';
        await repo.save(matchId, region, mockData);
        const found = await repo.findOne(matchId);

        expect(found?.data.metadata.matchId).toBe(matchId);
        expect(found?.region).toBe(region);
    });
});
