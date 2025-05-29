/**
 * @file src/app.module.ts
 */

import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RiotModule } from './features/riot/riot.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';
import { MatchPersistenceModule } from '@persistence/match/match.module';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { TrackerModule } from '@features/tracker/tracker.module';
import { DiscordModule } from '@features/discord/discord.module';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        DatabaseModule,

        // Feature modules
        RiotModule,
        TrackerModule,
        DiscordModule,

        // Persistence modules
        PlayerPersistenceModule,
        MatchPersistenceModule,
        GuildPersistenceModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
