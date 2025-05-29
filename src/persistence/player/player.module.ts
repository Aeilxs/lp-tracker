import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from './player.schema';
import { PlayerRepository } from './player.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
    providers: [PlayerRepository],
    exports: [PlayerRepository],
})
export class PlayerPersistenceModule {}
