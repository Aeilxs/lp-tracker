import { RiotService } from '@features/riot/riot.service';
import { Injectable } from '@nestjs/common';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { MatchRepository } from '@persistence/match/match.repository';
import { PlayerRepository } from '@persistence/player/player.repository';

@Injectable()
export class TrackerService {
    constructor(
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
        private readonly matchRepo: MatchRepository,
    ) {}

    poll() {}
}
