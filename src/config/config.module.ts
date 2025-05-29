/**
 * @file config/config.module.ts
 * This file defines the configuration module for the application.
 */

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema';
import { ConfigService } from './config.service';
import { DEVELOPMENT, PRODUCTION } from './constants';

const ENV = process.env.NODE_ENV || DEVELOPMENT;

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: ENV === PRODUCTION,
            validationSchema: configSchema,
            validationOptions: { abortEarly: true },
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
