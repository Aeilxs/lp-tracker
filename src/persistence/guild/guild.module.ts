import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './guild.schema';
import { GuildRepository } from './guild.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }])],
    providers: [GuildRepository],
    exports: [GuildRepository],
})
export class GuildPersistenceModule {}
