import { MatchV5 } from '@features/riot/dtos';
import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { Player, RankedSnapshot } from '@persistence/player/player.schema';

@Injectable()
export class TrackerService {
    constructor(
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
        private readonly logger: LoggerService,
    ) {}

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron(): Promise<void> {
        this.logger.verbose('[Tracker] Cron polling started');
        await this.poll();
        this.logger.verbose('[Tracker] Cron polling finished');
    }

    async poll(): Promise<void> {
        try {
            const puuids = await this.getAllPuuids();
            this.logger.verbose(`[Tracker] Polling ${puuids.length} puuid(s)`);

            for (const [i, puuid] of puuids.entries()) {
                this.logger.verbose(`[Tracker] [${i + 1}/${puuids.length}] Synchronizing: ${puuid}`);
                await this.synchronizePlayer(puuid);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.logger.error(`[Tracker] Error in poll: ${err.message}`, err.stack);
            } else {
                this.logger.error('[Tracker] Unknown error in poll', JSON.stringify(err));
            }
        }
    }

    private async synchronizePlayer(puuid: string): Promise<void> {
        // Step 1: Load the player from the database using their PUUID
        const player = await this.playerRepo.findOne(puuid);
        if (!player) {
            this.logger.warn(`[Tracker] Skipping unknown player: ${puuid}`);
            return;
        }
        this.logger.verbose(`[Tracker] Loaded player: ${player.gameName}#${player.tagLine}`);

        // Step 2: Fetch new ranked state
        const freshRankedState = await this.riotService.fetchRankedStats(player.puuid, player.region);
        if (!freshRankedState) {
            this.logger.warn('Failed to fetch');
        }
    }

    private createSnapshot(player: Pick<Player, 'puuid' | 'ranked'>, match: MatchV5.MatchDTO): RankedSnapshot | null {
        console.log(player, match);
        return null;
    }

    private async getAllPuuids(): Promise<string[]> {
        const all = new Set<string>();
        const guilds = await this.guildRepo.findAll();
        for (const guild of guilds) {
            for (const puuid of guild.puuids) {
                all.add(puuid);
            }
        }

        return Array.from(all);
    }
}
