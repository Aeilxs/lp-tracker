import { RankedInfoDto } from '@features/riot/dtos';
import { RankedSnapshot } from '@persistence/player/player.schema';

/**
 * Builds a RankedSnapshot document from Riot data.
 *
 * @param before - Ranked info before the match
 * @param after - Ranked info after the match
 * @param matchId - Riot match ID
 * @param timestamp - Date of the match (prefer gameEndTimestamp from Riot)
 * @returns A RankedSnapshot
 */
export function buildRankedSnapshot(
    before: RankedInfoDto,
    after: RankedInfoDto,
    matchId: string,
    timestamp: Date,
): RankedSnapshot {
    return {
        matchId,
        timestamp,
        queueType: after.queueType,
        before: {
            tier: before.tier,
            rank: before.rank,
            leaguePoints: before.leaguePoints,
            wins: before.wins,
            losses: before.losses,
        },
        after: {
            tier: after.tier,
            rank: after.rank,
            leaguePoints: after.leaguePoints,
            wins: after.wins,
            losses: after.losses,
        },
    };
}
