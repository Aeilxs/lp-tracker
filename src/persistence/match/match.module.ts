import { ConfigModule } from '@config/config.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MatchRepository } from './match.repository';
import { Match, MatchSchema } from './match.schema';

@Module({
    imports: [ConfigModule, MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }])],
    providers: [MatchRepository],
    exports: [MatchRepository],
})
export class MatchPersistenceModule {}
