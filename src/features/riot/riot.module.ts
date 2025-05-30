/**
 * @file src/core/riot/riot.module.ts
 */

import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RiotService } from './riot.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                headers: { 'X-Riot-Token': config.riotApiKey },
                timeout: 5000,
                maxRedirects: 5,
            }),
        }),
    ],
    providers: [RiotService],
    exports: [RiotService],
})
export class RiotModule {}
