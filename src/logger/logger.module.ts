/**
 * @file src/logger/logger.module.ts
 */

import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [LoggerService, ConfigService],
    exports: [LoggerService],
})
export class LoggerModule {}
