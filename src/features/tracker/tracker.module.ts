import { RiotModule } from '@features/riot/riot.module';
import { Module } from '@nestjs/common';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';

import { TrackerService } from './tracker.service';

@Module({
    imports: [RiotModule, PlayerPersistenceModule, GuildPersistenceModule],
    providers: [TrackerService],
    exports: [TrackerService],
})
export class TrackerModule {}
