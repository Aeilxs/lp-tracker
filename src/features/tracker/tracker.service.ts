import { Injectable } from '@nestjs/common';
import { RiotService } from '@features/riot/riot.service';
import { PlayerRepository } from '@persistence/player/player.repository';
import { MatchRepository } from '@persistence/match/match.repository';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TrackerService {
    constructor(
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
        private readonly matchRepo: MatchRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    poll() {
        this.eventEmitter.emit('tracker.matchFound', {
            message: 'Match found !!!',
            matchId: '1234567890',
            guildId: 'guild123',
            playerId: 'player123',
        });
    }
}
