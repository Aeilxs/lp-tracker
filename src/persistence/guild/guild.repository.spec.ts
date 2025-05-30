import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { GuildRepository } from './guild.repository';
import { Guild, GuildSchema } from './guild.schema';

describe('GuildRepository', () => {
    let module: TestingModule;
    let repo: GuildRepository;
    let mongod: MongoMemoryServer;

    const mockGuild: Guild = {
        guildId: '123456789',
        puuids: ['puuid-1', 'puuid-2'],
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]),
            ],
            providers: [GuildRepository],
        }).compile();

        repo = module.get<GuildRepository>(GuildRepository);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    });

    beforeEach(async () => {
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }
    });

    it('should create and find a guild', async () => {
        await repo.save(mockGuild);
        const result = await repo.findOne(mockGuild.guildId);

        expect(result).toBeDefined();
        expect(result?.guildId).toBe(mockGuild.guildId);
        expect(result?.puuids).toEqual(expect.arrayContaining(['puuid-1', 'puuid-2']));
    });

    it('should add a player to puuids', async () => {
        await repo.save({ guildId: '123', puuids: [] });
        await repo.addPlayerToGuild('123', 'puuid-new');

        const result = await repo.findOne('123');
        expect(result?.puuids).toContain('puuid-new');
    });

    it('should not add the same puuid twice', async () => {
        await repo.save({ guildId: 'abc', puuids: ['dupe-puuid'] });
        await repo.addPlayerToGuild('abc', 'dupe-puuid');

        const result = await repo.findOne('abc');
        expect(result?.puuids).toEqual(['dupe-puuid']);
    });

    it('should remove a player from puuids', async () => {
        await repo.save({ guildId: 'guild-del', puuids: ['p1', 'p2'] });
        await repo.removePlayerFromGuild('guild-del', 'p2');

        const result = await repo.findOne('guild-del');
        expect(result?.puuids).toEqual(['p1']);
    });
});
