/**
 * @file src/core/riot/riot.module.ts
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { HttpModule } from '@nestjs/axios';
import { RiotService } from './riot.service';
import { ConfigService } from '@config/config.service';

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
