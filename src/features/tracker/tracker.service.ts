import { DiscordService } from '@features/discord/discord.service';
import { QUEUE_ID, QUEUE_TYPE } from '@features/riot/constants';
import { MatchV5 } from '@features/riot/dtos';
import { RiotService } from '@features/riot/riot.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { MatchRepository } from '@persistence/match/match.repository';
import { PlayerRepository } from '@persistence/player/player.repository';
import { Player, RankedSnapshot } from '@persistence/player/player.schema';

@Injectable()
export class TrackerService {
    constructor(
        private readonly riotService: RiotService,
        private readonly playerRepo: PlayerRepository,
        private readonly guildRepo: GuildRepository,
        private readonly matchRepo: MatchRepository,
        private readonly discordService: DiscordService,
        private readonly loggerService: LoggerService,
    ) {}

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron(): Promise<void> {
        this.loggerService.verbose('[Tracker] Cron polling started');
        await this.poll();
        this.loggerService.verbose('[Tracker] Cron polling finished');
    }

    async poll(): Promise<void> {
        try {
            const puuids = await this.getAllPuuids();
            this.loggerService.verbose(`Polling ${puuids.length} puuid(s)`);

            for (const [i, puuid] of puuids.entries()) {
                this.loggerService.verbose(`[${i + 1}/${puuids.length}] Synchronizing: ${puuid}`);
                await this.synchronizePlayer(puuid);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.loggerService.error(`Error in poll: ${err.message}`, err.stack);
            } else {
                this.loggerService.error('Unknown error in poll', JSON.stringify(err));
            }
        }
    }

    private async synchronizePlayer(puuid: string): Promise<void> {
        const player = await this.playerRepo.findOne(puuid);
        if (!player) {
            this.loggerService.error(`Skipping unknown player: ${puuid}`);
            return;
        }
        this.loggerService.verbose(`Loaded player: ${player.gameName}#${player.tagLine}`);

        const matchIds = await this.riotService.fetchRecentRankedMatchIds(puuid, player.region, 10);
        this.loggerService.verbose(`Recent matchIds: ${JSON.stringify(matchIds)}`);
        if (!matchIds?.length) {
            this.loggerService.warn(`Couldn't get matchIds for ${player.gameName} (puuid: ${player.puuid})`);
            return;
        }

        const newMatches = await this.filterNewMatches(matchIds);
        if (!newMatches.length) {
            this.loggerService.verbose(`No new matches for ${player.gameName}#${player.tagLine}`);
            return;
        }

        const matchMap = await this.fetchAndStoreMatches(newMatches, player.region);
        if (!matchMap.size) return;

        const freshRankedState = await this.riotService.fetchRankedStats(player.summonerId, player.region);
        if (!freshRankedState) {
            this.loggerService.warn(`Failed to fetch ranked stats for ${player.gameName}#${player.tagLine}`);
            return;
        }

        const ranked = {
            soloQ: freshRankedState.find((r) => r.queueType === QUEUE_TYPE.RANKED_SOLO_5x5),
            flexQ: freshRankedState.find((r) => r.queueType === QUEUE_TYPE.RANKED_FLEX_SR),
        };

        await this.playerRepo.updateRankedState(player.puuid, ranked);

        const matchesByQueue = new Map<QUEUE_TYPE, MatchV5.MatchDTO>();

        for (const match of matchMap.values()) {
            const queueType = this.queueIdToQueueType(match.info.queueId);
            if (!queueType) continue;

            const existing = matchesByQueue.get(queueType);
            if (!existing || match.info.gameEndTimestamp > existing.info.gameEndTimestamp) {
                matchesByQueue.set(queueType, match);
            }
        }

        for (const [queueType, match] of matchesByQueue.entries()) {
            const snapshot = this.createSnapshot({ puuid: player.puuid, ranked }, match);
            if (snapshot) {
                this.loggerService.verbose(`Creating snapshot for match ${snapshot.matchId} (${queueType})`);
                await this.playerRepo.addSnapshot(player.puuid, snapshot);
            }
        }
    }

    private async filterNewMatches(matchIds: string[]): Promise<string[]> {
        const newMatches: string[] = [];

        for (const matchId of matchIds) {
            const exists = await this.matchRepo.findOne(matchId);
            if (!exists) newMatches.push(matchId);
        }

        return newMatches;
    }

    private async fetchAndStoreMatches(matchIds: string[], region: string): Promise<Map<string, MatchV5.MatchDTO>> {
        const matchMap = new Map<string, MatchV5.MatchDTO>();

        for (const matchId of matchIds) {
            const matchDto = await this.riotService.fetchMatchById(matchId, region);
            if (!matchDto) {
                this.loggerService.warn(`Couldn't get match ${matchId}`);
                continue;
            }

            await this.matchRepo.save(matchId, matchDto);
            const queueType = this.queueIdToQueueType(matchDto.info.queueId);
            if (!queueType) {
                this.loggerService.verbose(`Skipping match ${matchId} with unknown queueId = ${matchDto.info.queueId}`);
                continue;
            }

            this.loggerService.verbose(`Saved match ${matchId} for queue ${queueType}`);
            matchMap.set(matchId, matchDto);
        }

        return matchMap;
    }

    private createSnapshot(player: Pick<Player, 'puuid' | 'ranked'>, match: MatchV5.MatchDTO): RankedSnapshot | null {
        if (!player.puuid) {
            this.loggerService.warn(`[Snapshot] No puuid provided`);
            return null;
        }

        const participant = match.info.participants.find((p) => p.puuid === player.puuid);
        if (!participant) {
            this.loggerService.verbose(
                `[Snapshot] Player ${player.puuid} not found in match ${match.metadata.matchId} participants: ${match.info.participants
                    .map((p) => p.puuid)
                    .join(', ')}`,
            );
            return null;
        }

        const queueType = this.queueIdToQueueType(match.info.queueId);
        if (!queueType) return null;

        const ranked =
            queueType === QUEUE_TYPE.RANKED_SOLO_5x5
                ? player.ranked.soloQ
                : queueType === QUEUE_TYPE.RANKED_FLEX_SR
                  ? player.ranked.flexQ
                  : undefined;

        if (!ranked) {
            this.loggerService.verbose(`[Snapshot] No ranked data for queue ${queueType}`);
            return null;
        }

        return {
            matchId: match.metadata.matchId,
            timestamp: new Date(match.info.gameEndTimestamp),
            queueType,
            snapshot: ranked,
        };
    }

    private queueIdToQueueType(id: QUEUE_ID): QUEUE_TYPE | null {
        switch (id) {
            case QUEUE_ID.RANKED_SOLO_5x5:
                return QUEUE_TYPE.RANKED_SOLO_5x5;
            case QUEUE_ID.RANKED_FLEX_SR:
                return QUEUE_TYPE.RANKED_FLEX_SR;
            default:
                return null;
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
