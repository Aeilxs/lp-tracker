import { DiscordModule } from '@features/discord/discord.module';
import { RiotModule } from '@features/riot/riot.module';
import { Module } from '@nestjs/common';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { MatchPersistenceModule } from '@persistence/match/match.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';

import { TrackerService } from './tracker.service';

@Module({
    imports: [RiotModule, MatchPersistenceModule, PlayerPersistenceModule, GuildPersistenceModule, DiscordModule],
    providers: [TrackerService],
    exports: [TrackerService],
})
export class TrackerModule {}
