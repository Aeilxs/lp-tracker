/**
 * @file src/app.module.ts
 */

import { DiscordModule } from '@features/discord/discord.module';
import { TrackerModule } from '@features/tracker/tracker.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';

import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RiotModule } from './features/riot/riot.module';
import { LoggerModule } from './logger/logger.module';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        DatabaseModule,
        ScheduleModule.forRoot(),

        // Feature modules
        RiotModule,
        TrackerModule,
        DiscordModule,

        // Persistence modules
        PlayerPersistenceModule,
        GuildPersistenceModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
