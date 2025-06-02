/**
 * @file config/config.service.ts
 */

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import {
    DISCORD_TOKEN,
    DISCORD_TEST_GUILD_ID,
    LOG_LEVEL,
    MONGO_URI,
    NODE_ENV,
    PORT,
    RIOT_API_KEY,
    MONGO_DB_NAME,
    DEVELOPMENT,
    PRODUCTION,
} from './constants';

@Injectable()
export class ConfigService {
    constructor(private readonly config: NestConfigService) {}

    get nodeEnv(): string {
        const env = this.config.get<string>(NODE_ENV);
        if (!env) throw new Error('Node environment is not set');
        return env;
    }

    get port(): number {
        const port = this.config.get<number>(PORT);
        if (!port) throw new Error('Port is not set');
        return port;
    }

    get logLevel(): string {
        const level = this.config.get<string>(LOG_LEVEL);
        if (!level) throw new Error('Log level is not set');
        return level;
    }

    get riotApiKey(): string {
        const k = this.config.get<string>(RIOT_API_KEY);
        if (!k) throw new Error('Riot API key is not set');
        return k;
    }

    get discordToken(): string {
        const t = this.config.get<string>(DISCORD_TOKEN);
        if (!t) throw new Error('Discord token is not set');
        return t;
    }

    get discordTestGuildId(): string {
        const guildId = this.config.get<string>(DISCORD_TEST_GUILD_ID);
        if (!guildId) throw new Error('Discord test guild ID is not set');
        return guildId;
    }

    get mongoDbName(): string {
        const name = this.config.get<string>(MONGO_DB_NAME);
        if (!name) throw new Error('Mongo DB name is not set');
        return name;
    }

    get mongoUri(): string {
        const uri = this.config.get<string>(MONGO_URI);
        if (!uri) throw new Error('Mongo URI is not set');
        return uri;
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === DEVELOPMENT;
    }

    get isProduction(): boolean {
        return this.nodeEnv === PRODUCTION;
    }

    dump(): void {
        console.log('\n\t##################################################################');
        console.log('\t#                                                                #');
        console.log('\t#                          CONFIG DUMP                           #');
        console.log('\t#                                                                #');
        console.log('\t##################################################################\n');

        console.log(`\t> NODE_ENV: ${this.nodeEnv}`);
        console.log(`\t> PORT: ${this.port}`);
        console.log(`\t> LOG_LEVEL: ${this.logLevel}`);
        console.log(`\t> RIOT_API_KEY: ${this.riotApiKey}`);
        console.log(`\t> DISCORD_TOKEN: ${this.discordToken}`);
        console.log(`\t> MONGO_DB_NAME: ${this.mongoDbName}`);
        console.log(`\t> MONGO_URI: ${this.mongoUri}`);
    }
}
