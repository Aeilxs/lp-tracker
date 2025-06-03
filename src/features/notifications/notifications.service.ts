import { DiscordService } from '@features/discord/discord.service';
import { QUEUE_ID, QUEUE_TYPE } from '@features/riot/constants';
import { MatchV5 } from '@features/riot/dtos';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { Player, RankedState } from '@persistence/player/player.schema';

/**
 * Rich object returned by analyseMatch() so TrackerService can decide what to do next.
 */
export interface MatchAnalysis {
    /** Riot match ID */
    matchId: string;
    /** Queue (solo/flex) the match was played in */
    queueType: QUEUE_TYPE;
    /** Did the player win? */
    win: boolean;
    /** Basic combat stats */
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    /** Creep score & economy */
    cs: number;
    csPerMin: number;
    goldEarned: number;
    damageDealtToChampions: number;
    /** Ranked progression */
    lpBefore: number | null;
    lpAfter: number | null;
    lpDelta: number | null;
    tierBefore: string | null;
    tierAfter: string | null;
    rankBefore: string | null;
    rankAfter: string | null;
    promoted: boolean;
    demoted: boolean;
    /** Cosmetic */
    championName: string;
    role: string;
    /** Full DTO for further processing if needed */
    rawParticipant: MatchV5.ParticipantDTO | null;
}

/* -------------------------------------------------------------------------- */
/*                        Internal helper / shared types                      */
/* -------------------------------------------------------------------------- */

export type RankedComparable = {
    tier?: string;
    rank?: string;
    leaguePoints?: number;
} | null;

@Injectable()
export class NotificationsService {
    constructor(
        private readonly discordService: DiscordService,
        private readonly guildRepo: GuildRepository,
        private readonly logger: LoggerService,
    ) {}

    /**
     * Main entry point called from TrackerService. Performs analysis & dispatch.
     */
    async analyzeMatch(
        before: RankedState,
        after: RankedState,
        player: Player,
        match: MatchV5.MatchDTO,
        queue: QUEUE_ID,
    ): Promise<void> {
        const analysis = this.buildMatchAnalysis(before, after, player, match, queue);
        const message = this.formatSummary(player, analysis);
        await this.publishToGuilds(player.puuid, message);
    }

    /* -------------------------------------------------------------------------- */
    /*                           Internal helper logic                            */
    /* -------------------------------------------------------------------------- */

    private buildMatchAnalysis(
        before: RankedState,
        after: RankedState,
        player: Player,
        match: MatchV5.MatchDTO,
        queue: QUEUE_ID,
    ): MatchAnalysis {
        const queueType = this.queueIdToQueueType(queue);
        const participant = match.info.participants.find((p) => p.puuid === player.puuid) ?? null;
        if (!participant) {
            const fmt = `Couldn't find self (${player.gameName}#${player.tagLine})`;
            this.logger.error(fmt);
            throw new Error(fmt);
        }

        // Combat / farming stats
        const kills = participant.kills ?? 0;
        const deaths = participant.deaths ?? 0;
        const assists = participant.assists ?? 0;
        const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
        const cs = (participant.totalMinionsKilled ?? 0) + (participant.neutralMinionsKilled ?? 0);
        const minutes = (match.info.gameDuration || 0) / 60;
        const csPerMin = minutes ? cs / minutes : 0;

        // Ranked delta (handle undefined)
        const beforeInfo = queueType === QUEUE_TYPE.RANKED_SOLO_5x5 ? before.soloQ : before.flexQ;
        const afterInfo = queueType === QUEUE_TYPE.RANKED_SOLO_5x5 ? after.soloQ : after.flexQ;

        const lpBefore = beforeInfo?.leaguePoints ?? null;
        const lpAfter = afterInfo?.leaguePoints ?? null;
        const lpDelta = lpBefore !== null && lpAfter !== null ? lpAfter - lpBefore : null;

        const promoted = this.isPromotion(beforeInfo as RankedComparable, afterInfo as RankedComparable);
        const demoted = this.isDemotion(beforeInfo as RankedComparable, afterInfo as RankedComparable);

        return {
            matchId: match.metadata.matchId,
            queueType,
            win: participant.win ?? false,
            kills,
            deaths,
            assists,
            kda: Math.round(kda * 100) / 100,
            cs,
            csPerMin: Math.round(csPerMin * 100) / 100,
            goldEarned: participant.goldEarned ?? 0,
            damageDealtToChampions: participant.totalDamageDealtToChampions ?? 0,
            lpBefore,
            lpAfter,
            lpDelta,
            tierBefore: beforeInfo?.tier ?? null,
            tierAfter: afterInfo?.tier ?? null,
            rankBefore: beforeInfo?.rank ?? null,
            rankAfter: afterInfo?.rank ?? null,
            promoted,
            demoted,
            championName: participant.championName ?? 'Unknown',
            role: participant.teamPosition ?? '',
            rawParticipant: participant,
        };
    }

    /* ------------------------------ Promo / démo ------------------------------ */
    private isPromotion(before: RankedComparable, after: RankedComparable): boolean {
        if (!before || !after) return false;
        return (
            after.tier !== before.tier ||
            (after.tier === before.tier &&
                after.rank !== before.rank &&
                (after.leaguePoints ?? 0) > (before.leaguePoints ?? 0))
        );
    }

    private isDemotion(before: RankedComparable, after: RankedComparable): boolean {
        if (!before || !after) return false;
        return (
            after.tier !== before.tier ||
            (after.tier === before.tier &&
                after.rank !== before.rank &&
                (after.leaguePoints ?? 0) < (before.leaguePoints ?? 0))
        );
    }

    /* ---------------------------- Message formatting --------------------------- */
    private formatSummary(player: Player, a: MatchAnalysis): string {
        const outcome = a.win ? 'VICTORY' : 'DEFEAT';
        const lpPart = a.lpDelta !== null ? `${a.lpDelta >= 0 ? '+' : ''}${a.lpDelta} LP` : 'LP N/A';

        let promoStr = '';
        if (a.promoted) promoStr = 'PROMOTED';
        else if (a.demoted) promoStr = 'DEMOTED';

        if (a.role === 'UTILITY') a.role = 'SUPPORT';

        return (
            '```diff\n' +
            `${a.win ? '+' : '-'} - ${outcome} - ${promoStr}\n` +
            '```\n' +
            '```ascii\n' +
            `${player.gameName}#${player.tagLine}\n` +
            `- ${a.kills}/${a.deaths}/${a.assists} KDA (${a.kda}) - ${a.championName} (${a.role})\n` +
            `- CS: ${a.cs} (${a.csPerMin}/min) - Gold: ${a.goldEarned}\n` +
            `- Damage: ${a.damageDealtToChampions}\n` +
            `- ${lpPart}\n` +
            '```'
        );
    }

    /* --------------------------- Discord publishing --------------------------- */
    private async publishToGuilds(puuid: string, content: string): Promise<void> {
        const guilds = await this.guildRepo.findAll();
        const targetGuilds = guilds.filter((g) => g.puuids.includes(puuid));

        console.log('CONTENT: \n', content);
        for (const g of targetGuilds) {
            await this.discordService.sendToTrackingChannel(g.guildId, content);
        }
    }

    /* ------------------------------- Utilities -------------------------------- */
    private queueIdToQueueType(id: QUEUE_ID): QUEUE_TYPE {
        return id === QUEUE_ID.RANKED_FLEX_SR ? QUEUE_TYPE.RANKED_FLEX_SR : QUEUE_TYPE.RANKED_SOLO_5x5;
    }
}
