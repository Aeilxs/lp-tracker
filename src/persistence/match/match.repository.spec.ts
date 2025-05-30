import { ConfigService } from '@config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { MatchRepository } from './match.repository';
import { Match, MatchSchema } from './match.schema';

describe('MatchRepository', () => {
    let module: TestingModule;
    let repo: MatchRepository;
    let mongod: MongoMemoryServer;

    const mockData = {
        info: { gameId: 12345, participants: [] },
        metadata: { matchId: 'EUW1_123456789', participants: ['puuid1'] },
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
            ],
            providers: [
                MatchRepository,
                {
                    provide: ConfigService,
                    useValue: { seasonInfo: { year: 2024, season: 1, split: 2, preseason: false } },
                },
            ],
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
        await mongod.stop();
    });

    it('should save and retrieve a raw match', async () => {
        const matchId = 'EUW1_123456789';
        await repo.save(matchId, mockData);
        const found = await repo.findOne(matchId);

        expect(found?.data.metadata.matchId).toBe(matchId);
        expect(found?.seasonInfo.preseason).toBe(false);
        expect(found?.seasonInfo.season).toBe(1);
        expect(found?.seasonInfo.split).toBe(2);
        expect(found?.seasonInfo.year).toBe(2024);
    });
});
