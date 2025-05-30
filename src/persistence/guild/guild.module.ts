import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GuildRepository } from './guild.repository';
import { Guild, GuildSchema } from './guild.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }])],
    providers: [GuildRepository],
    exports: [GuildRepository],
})
export class GuildPersistenceModule {}
