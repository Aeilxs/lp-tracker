import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlayerRepository } from './player.repository';
import { Player, PlayerSchema } from './player.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
    providers: [PlayerRepository],
    exports: [PlayerRepository],
})
export class PlayerPersistenceModule {}
