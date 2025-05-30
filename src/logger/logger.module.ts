/**
 * @file src/logger/logger.module.ts
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

import { LoggerService } from './logger.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [LoggerService, ConfigService],
    exports: [LoggerService],
})
export class LoggerModule {}
