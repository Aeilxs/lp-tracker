import { Module } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { RiotModule } from '@features/riot/riot.module';
import { MatchPersistenceModule } from '@persistence/match/match.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        RiotModule,
        MatchPersistenceModule,
        PlayerPersistenceModule,
        GuildPersistenceModule,
    ],
    providers: [TrackerService],
    exports: [TrackerService],
})
export class TrackerModule {}
