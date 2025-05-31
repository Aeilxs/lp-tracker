/**
 * @file src/core/riot/riot.service.ts
 */

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from 'src/logger/logger.service';

import { QUEUE_ID, QUEUE_TYPE } from './constants';
import { AccountDTO, ActiveGameDTO, MatchV5, PlayerProfileDTO, RankedInfoDTO, SummonerDTO } from './dtos';

@Injectable()
export class RiotService {
    constructor(
        private readonly http: HttpService,
        private readonly loggerService: LoggerService,
    ) {}

    async fetchFullPlayerProfile(gameName: string, tagLine: string, region: string): Promise<PlayerProfileDTO | null> {
        this.loggerService.verbose(`Fetching Riot data for ${gameName}#${tagLine} (${region.toUpperCase()})`);
        try {
            const normalizedRegion = region.toLowerCase();
            const regionalHost = this.getRegionalHost(region);
            if (!regionalHost) {
                this.loggerService.warn('Invalid region');
                return null;
            }

            this.loggerService.verbose(`[1/3] Fetching PUUID for RiotID: ${gameName}#${tagLine}`);
            const account = await this.fetchRiotAccount(gameName, tagLine, regionalHost);
            if (!account) return null;

            this.loggerService.verbose(`[2/3] Fetching Summoner data with PUUID`);
            const summoner = await this.fetchSummonerInfo(account.puuid, normalizedRegion);
            if (!summoner) return null;

            this.loggerService.verbose(`[3/3] Fetching Ranked data by Summoner ID`);
            const ranked = await this.fetchRankedStats(summoner.id, normalizedRegion);
            if (!ranked) return null;

            return {
                account,
                summoner,
                ranked: {
                    soloQ: ranked.find((r) => r.queueType === QUEUE_TYPE.RANKED_SOLO_5x5) || null,
                    flexQ: ranked.find((r) => r.queueType === QUEUE_TYPE.RANKED_FLEX_SR) || null,
                },
            };
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch Riot data for ${gameName}#${tagLine} (${region})`);
            return null;
        }
    }

    /**
     * Fetches a Riot account by game name and tag line.
     * Returns a `AccountDto` object or null if the request fails.
     *
     * @param gameName - The player's Riot game name (e.g. 'Faker')
     * @param tagLine - The player's Riot tag line (e.g. 'KR1')
     * @param host - The regional API host (e.g. 'americas.api.riotgames.com')
     * @returns The Riot account information or null if the request fails
     */
    async fetchRiotAccount(gameName: string, tagLine: string, host: string): Promise<AccountDTO | null> {
        try {
            const url = `https://${host}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
            const res = await firstValueFrom(this.http.get<AccountDTO>(url));
            return res.data;
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch Riot account for ${gameName}#${tagLine}`);
            return null;
        }
    }

    /**
     * Fetches summoner information using the player's PUUID.
     * Returns a `RiotSummonerDto` object or null if the request fails.
     *
     * @param puuid - PUUID of the player
     * @param region - Riot platform ID (e.g. 'euw1', 'na1', etc.)
     * @returns The summoner information or null if the request fails
     */
    async fetchSummonerInfo(puuid: string, region: string): Promise<SummonerDTO | null> {
        try {
            const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
            const res = await firstValueFrom(this.http.get<SummonerDTO>(url));
            return res.data;
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch summoner info for PUUID ${puuid} (${region})`);
            return null;
        }
    }

    /**
     * Fetches ranked stats for a summoner by their summoner ID.
     * Returns an array of ranked entries (soloQ, flexQ, etc.) or null if the request fails.
     *
     * @param summonerId - Summoner ID (obtained from the summoner info dto)
     * @param region - Riot platform ID (e.g. 'euw1', 'na1', etc.)
     * @returns An array of ranked stats or null if the request fails
     */
    async fetchRankedStats(summonerId: string, region: string): Promise<RankedInfoDTO[] | null> {
        try {
            const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
            const res = await firstValueFrom(this.http.get<RankedInfoDTO[]>(url));
            return res.data;
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch ranked stats for summoner ID ${summonerId} (${region})`);
            return null;
        }
    }

    /**
     * Checks if a player is currently in an active game using their PUUID.
     *
     * @param puuid - PUUID of the player
     * @param region - Riot platform ID (e.g. 'euw1', 'na1', etc.)
     * @returns The active game data if in game, or null if not
     */
    async fetchCurrentGame(puuid: string, region: string): Promise<ActiveGameDTO | null> {
        this.loggerService.verbose(`Checking current game for puuid: ${puuid} (${region.toUpperCase()})`);
        try {
            const normalizedRegion = region.toLowerCase();
            const url = `https://${normalizedRegion}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
            const res = await firstValueFrom(this.http.get<ActiveGameDTO>(url));
            return res.data;
        } catch (err) {
            const axiosErr = err as AxiosError;
            const status = axiosErr?.response?.status;

            if (status === HttpStatus.NOT_FOUND) {
                this.loggerService.verbose(`No active game for puuid ${puuid}`);
                return null;
            }

            this.handleRiotApiError(err, `Error checking active game for puuid ${puuid}`);
            return null;
        }
    }

    /**
     * Retrieves a list of recent ranked match for a player.
     *
     * @param puuid - PUUID
     * @param region - Platform (e.g. euw1, na1)
     * @param count - Number of match IDs to fetch (1-100)
     * @returns ["matchId1", "matchId2", ...] or null if the request fails
     */
    async fetchRecentRankedMatchIds(puuid: string, region: string, count: number = 10): Promise<string[] | null> {
        const host = this.getRegionalHost(region);
        if (!host) {
            this.loggerService.warn(`Unknown host for region: ${region}`);
            return null;
        }

        try {
            const url = `https://${host}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
            const [soloQRes, flexQRes] = await Promise.all([
                firstValueFrom(this.http.get<string[]>(url, { params: { queue: QUEUE_ID.RANKED_SOLO_5x5, count } })),
                firstValueFrom(this.http.get<string[]>(url, { params: { queue: QUEUE_ID.RANKED_FLEX_SR, count } })),
            ]);

            // Combine results from both queues and remove duplicates even if it's not strictly necessary
            const combined = Array.from(new Set([...soloQRes.data, ...flexQRes.data]));
            return combined;
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch ranked match IDs for ${puuid}`);
            return null;
        }
    }

    /**
     * Retrieves the full match details by match ID.
     *
     * @param matchId - id (e.g. "EUW1_7413869413")
     * @param region - Platform (e.g. "euw1", "na1", etc.)
     * @returns MatchDto or null if the request fails
     */
    async fetchMatchById(matchId: string, region: string): Promise<MatchV5.MatchDTO | null> {
        const host = this.getRegionalHost(region);
        if (!host) {
            this.loggerService.warn(`Unknown host for region: ${region}`);
            return null;
        }

        const url = `https://${host}/lol/match/v5/matches/${matchId}`;

        try {
            const res = await firstValueFrom(this.http.get<MatchV5.MatchDTO>(url));
            return res.data;
        } catch (err) {
            this.handleRiotApiError(err, `Failed to fetch match by ID: ${matchId}`);
            return null;
        }
    }

    /**
     * Resolves a Riot region (platform ID) to its corresponding regional API host.
     *
     * @param region - A platform ID (e.g. 'euw1', 'na1', 'kr', ...)
     * @returns The regional API domain or `null` if the region is invalid
     */
    private getRegionalHost(region: string): string | null {
        const regionToHost: Record<string, string> = {
            na1: 'americas.api.riotgames.com',
            br1: 'americas.api.riotgames.com',
            la1: 'americas.api.riotgames.com',
            la2: 'americas.api.riotgames.com',
            kr: 'asia.api.riotgames.com',
            jp1: 'asia.api.riotgames.com',
            euw1: 'europe.api.riotgames.com',
            eune1: 'europe.api.riotgames.com',
            tr1: 'europe.api.riotgames.com',
            ru: 'europe.api.riotgames.com',
        };

        return regionToHost[region.toLowerCase()] || null;
    }

    /**
     * Logs detailed error information from a failed Riot API call.
     * Categorizes known status codes (403, 404, 429...) and logs unexpected ones as errors.
     *
     * @param err - The error thrown by Axios
     * @param ctx - A short context message for better traceability
     */
    private handleRiotApiError(err: unknown, ctx: string): void {
        const axiosErr = err as AxiosError;
        const status = axiosErr?.response?.status;
        const data = axiosErr?.response?.data;

        const base = `[Riot API] ${ctx}`;
        const statusMsg = status ? `(status ${status})` : '';

        if (status === HttpStatus.TOO_MANY_REQUESTS) {
            this.loggerService.warn(`${base} – Rate limited: ${statusMsg}`);
        } else if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
            this.loggerService.warn(`${base} – Unauthorized or forbidden: ${statusMsg}`);
        } else if (status === HttpStatus.NOT_FOUND) {
            this.loggerService.verbose(`${base} – Resource not found: ${statusMsg}`);
        } else {
            this.loggerService.error(`${base} – Unexpected error: ${statusMsg}`, axiosErr?.stack);
        }

        if (data) {
            this.loggerService.debug(`${base} – Response data: ${JSON.stringify(data, null, 4)}`);
        }

        if (!status) {
            this.loggerService.debug(`${base} – Unknown error: ${JSON.stringify(err)}`);
        }
    }
}
