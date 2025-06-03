import { NotificationsService } from '@features/notifications/notifications.service';
import { QUEUE_ID, QUEUE_TYPE } from '@features/riot/constants';
import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { RankedSnapshot, RankedState } from '@persistence/player/player.schema';

@Injectable()
export class TrackerService {
    constructor(
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
        private readonly notificationService: NotificationsService,
        private readonly logger: LoggerService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
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
                await this.synchronizePlayer(puuid, QUEUE_ID.RANKED_SOLO_5x5);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.logger.error(`[Tracker] Error in poll: ${err.message}`, err.stack);
            } else {
                this.logger.error('[Tracker] Unknown error in poll', JSON.stringify(err));
            }
        }
    }

    private async synchronizePlayer(
        puuid: string,
        queue: QUEUE_ID.RANKED_SOLO_5x5 | QUEUE_ID.RANKED_FLEX_SR,
    ): Promise<void> {
        // Step 1: Load the player from the database using their PUUID
        const player = await this.playerRepo.findOne(puuid);
        if (!player) {
            this.logger.warn(`[Tracker] Skipping unknown player: ${puuid}`);
            return;
        }
        this.logger.verbose(`[Tracker] Loaded player: ${player.gameName}#${player.tagLine}`);

        // Step 2: Check if player got new match
        const res = await this.riotService.fetchRecentRankedMatchIds(player.puuid, player.region, queue, 1);
        if (!res) {
            this.logger.error('[Tracker] Failed to retrieve last match ID');
            return;
        }
        const newMatchId = res[0];

        const existingMatchIds = new Set(player.snapshots.map((s) => s.matchId));
        if (existingMatchIds.has(newMatchId)) {
            this.logger.verbose(`No new match for ${player.gameName}#${player.tagLine}`);
            return;
        }

        // Step 3: Fetch all we need
        const match = await this.riotService.fetchMatchById(newMatchId, player.region);
        if (!match) {
            this.logger.error('[Tracker] Failed to retrieve match');
            return;
        }

        const freshRankedData = await this.riotService.fetchRankedStats(player.summonerId, player.region);
        if (!freshRankedData?.length) {
            this.logger.error('[Tracker] Failed to fetch fresh ranked state.');
            return;
        }

        const freshRankedState: RankedState = {
            soloQ: freshRankedData.find((a) => a.queueType === QUEUE_TYPE.RANKED_SOLO_5x5),
            flexQ: freshRankedData.find((a) => a.queueType === QUEUE_TYPE.RANKED_SOLO_5x5),
        };
        const oldRankedState = player.ranked;

        // Step 4: Update player ranked info
        void this.playerRepo.updateRankedState(player.puuid, freshRankedState);
        const snapshot = this.createSnapshot(
            player.puuid,
            newMatchId,
            this.queueIdToQueueType(queue),
            freshRankedState,
        );

        if (!snapshot) {
            this.logger.error(`Snapshot creation error: ${snapshot}`);
            return;
        }
        void this.playerRepo.addSnapshot(player.puuid, snapshot);

        await this.notificationService.analyzeMatch(oldRankedState, freshRankedState, player, match, queue);
    }

    private createSnapshot(
        puuid: string,
        matchId: string,
        queue: QUEUE_TYPE,
        rank: RankedState,
    ): RankedSnapshot | null {
        const info = queue === QUEUE_TYPE.RANKED_SOLO_5x5 ? rank.soloQ : rank.flexQ;
        if (!info) {
            throw new Error('RankedInfo is undefined for the selected queue type');
        }
        return {
            matchId,
            queueType: queue,
            timestamp: new Date(),
            snapshot: info,
        };
    }

    private queueIdToQueueType(id: QUEUE_ID): QUEUE_TYPE {
        switch (id) {
            case QUEUE_ID.RANKED_SOLO_5x5:
                return QUEUE_TYPE.RANKED_SOLO_5x5;
            case QUEUE_ID.RANKED_FLEX_SR:
                return QUEUE_TYPE.RANKED_FLEX_SR;
        }
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
