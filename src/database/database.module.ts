/**
 * @file src/database/database.module.ts
 */

import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                uri: config.mongoUri,
                dbName: config.mongoDbName,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
