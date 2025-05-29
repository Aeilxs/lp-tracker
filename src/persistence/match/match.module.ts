import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './match.schema';
import { MatchRepository } from './match.repository';
import { ConfigModule } from '@config/config.module';

@Module({
    imports: [ConfigModule, MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }])],
    providers: [MatchRepository],
    exports: [MatchRepository],
})
export class MatchPersistenceModule {}
