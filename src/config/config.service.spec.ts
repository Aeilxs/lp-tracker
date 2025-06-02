/**
 * @file config/config.service.spec.ts
 */

import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { configSchema } from './config.schema';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
    // Helper function to set up environment variables for tests
    const setupEnv = (env: Partial<NodeJS.ProcessEnv>) => {
        process.env = {
            ...process.env,
            NODE_ENV: 'development',
            PORT: '3000',
            LOG_LEVEL: 'debug',
            RIOT_API_KEY: 'riot-key',
            DISCORD_TOKEN: 'discord-token',
            MONGO_DB_NAME: 'db-test',
            MONGO_URI: 'mongodb://localhost:27017',
            ...env,
        };
    };

    let service: ConfigService;

    beforeEach(async () => {
        setupEnv({}); // Reset process.env

        // Create a testing module with ConfigModule and ConfigService
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    // Ignore .env files for this test as we're setting env vars directly
                    ignoreEnvFile: true,
                    validationSchema: configSchema,
                    validationOptions: { abortEarly: true },
                }),
            ],
            providers: [ConfigService],
        }).compile();

        service = module.get(ConfigService);
    });

    afterAll(() => {
        // Nettoyage des envs potentiellement polluantes
        const keysToRemove = [
            'SEASON_INFO',
            'NODE_ENV',
            'PORT',
            'LOG_LEVEL',
            'RIOT_API_KEY',
            'DISCORD_TOKEN',
            'DISCORD_TEST_GUILD_ID',
            'MONGO_DB_NAME',
            'MONGO_URI',
        ];

        for (const key of keysToRemove) {
            delete process.env[key];
        }
    });

    it('should be defined and return expected config values', () => {
        expect(service).toBeDefined();
        expect(service.port).toBe(3000);
        expect(service.riotApiKey).toBe('riot-key');
        expect(service.discordToken).toBe('discord-token');
        expect(service.mongoDbName).toBe('db-test');
        expect(service.mongoUri).toBe('mongodb://localhost:27017');
        expect(service.nodeEnv).toBe('development');
        expect(service.logLevel).toBe('debug');
    });

    it('should detect dev env correctly', () => {
        expect(service.isDevelopment).toBe(true);
        expect(service.isProduction).toBe(false);
    });
});
