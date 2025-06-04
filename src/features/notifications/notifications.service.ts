import { DiscordService } from '@features/discord/discord.service';
import { QUEUE_ID, QUEUE_TYPE } from '@features/riot/constants';
import { MatchV5 } from '@features/riot/dtos';
import { LoggerService } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';
import { GuildRepository } from '@persistence/guild/guild.repository';
import { Player, RankedState } from '@persistence/player/player.schema';

import { RankedComparable, RankUtils } from './rank-utils';

/**
 * object returned by analyseMatch()
 */
export interface MatchAnalysis {
    matchId: string;
    queueType: QUEUE_TYPE;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    kp: number | null;
    cs: number;
    csPerMin: number;
    goldEarned: number;
    damageDealtToChampions: number;
    pinksBought: number;
    visionScore: number;
    lpBefore: number | null;
    lpAfter: number | null;
    lpDelta: number | null;
    tierBefore: string | null;
    tierAfter: string | null;
    rankBefore: string | null;
    rankAfter: string | null;
    promoted: boolean;
    demoted: boolean;
    championName: string;
    role: string;
    rawParticipant: MatchV5.ParticipantDTO | null;
}

@Injectable()
export class NotificationsService {
    constructor(
        private readonly discordService: DiscordService,
        private readonly guildRepo: GuildRepository,
        private readonly logger: LoggerService,
    ) {}

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

        const teamId = participant.teamId;
        const teamParticipants = match.info.participants.filter((p) => p.teamId === teamId);

        const teamKills = teamParticipants.reduce((sum, p) => sum + (p.kills ?? 0), 0);

        /* CBT/FARM */
        const kills = participant.kills ?? 0;
        const deaths = participant.deaths ?? 0;
        const assists = participant.assists ?? 0;
        const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
        const cs = (participant.totalMinionsKilled ?? 0) + (participant.neutralMinionsKilled ?? 0);
        const minutes = (match.info.gameDuration || 0) / 60;
        const csPerMin = minutes ? cs / minutes : 0;
        const kp = teamKills > 0 ? Math.round(((kills + assists) / teamKills) * 100) : null;

        /* VISION */
        const pinksBought = participant.visionWardsBoughtInGame;
        const visionScore = participant.visionScore;

        /* RANK */
        const beforeInfo = queueType === QUEUE_TYPE.RANKED_SOLO_5x5 ? before.soloQ : before.flexQ;
        const afterInfo = queueType === QUEUE_TYPE.RANKED_SOLO_5x5 ? after.soloQ : after.flexQ;

        const lpBefore = beforeInfo?.leaguePoints ?? null;
        const lpAfter = afterInfo?.leaguePoints ?? null;
        const lpDelta = RankUtils.lpDelta(beforeInfo as RankedComparable, afterInfo as RankedComparable);
        const promoted = RankUtils.isPromotion(beforeInfo as RankedComparable, afterInfo as RankedComparable);
        const demoted = RankUtils.isDemotion(beforeInfo as RankedComparable, afterInfo as RankedComparable);

        return {
            matchId: match.metadata.matchId,
            queueType,
            win: participant.win ?? false,
            kills,
            deaths,
            assists,
            pinksBought,
            visionScore,
            kda: Math.round(kda * 100) / 100,
            kp,
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

    private formatSummary(player: Player, a: MatchAnalysis): string {
        const outcome = a.win ? 'VICTORY' : 'DEFEAT';
        const rankFmt = RankUtils.formatRank(
            a.tierAfter as string,
            a.rankAfter as string,
            a.lpAfter as number,
            a.lpDelta as number,
        );

        let promoStr = '';
        if (a.promoted) promoStr = 'PROMOTED';
        else if (a.demoted) promoStr = 'DEMOTED';

        if (a.role === 'UTILITY') a.role = 'SUPPORT';
        if (a.role === 'BOTTOM') a.role = 'ADC';
        const kpFmt = a.kp !== null ? `${a.kp}%` : 'N/A';
        const gameDurationMin = Math.round(((a.rawParticipant?.timePlayed ?? 0) || 0) / 60);

        return (
            '```diff\n' +
            `${a.win ? '+' : '-'} ${player.gameName}#${player.tagLine} ${outcome} ${a.win ? '+' : '-'} ${promoStr}\n` +
            `> ${rankFmt}\n` +
            `> Duration: ${gameDurationMin} min\n` +
            `> ${a.kills}/${a.deaths}/${a.assists} - KDA|KP (${a.kda} | ${kpFmt}) - ${a.championName} (${a.role})\n` +
            `> Damage: ${a.damageDealtToChampions}\n` +
            `> CS: ${a.cs} (${a.csPerMin}/min) - Gold: ${a.goldEarned}\n` +
            `> Vision: Pink wards: ${a.pinksBought} - Vision score (${a.visionScore})\n` +
            '```'
        );
    }

    private async publishToGuilds(puuid: string, content: string): Promise<void> {
        const guilds = await this.guildRepo.findAll();
        const targetGuilds = guilds.filter((g) => g.puuids.includes(puuid));

        this.logger.log('CONTENT: \n');
        console.log(content);
        for (const g of targetGuilds) {
            await this.discordService.sendToTrackingChannel(g.guildId, content);
        }
    }

    private queueIdToQueueType(id: QUEUE_ID): QUEUE_TYPE {
        return id === QUEUE_ID.RANKED_FLEX_SR ? QUEUE_TYPE.RANKED_FLEX_SR : QUEUE_TYPE.RANKED_SOLO_5x5;
    }
}
