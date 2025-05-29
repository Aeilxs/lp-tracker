/**
 * @file src/core/riot/dtos.ts
 */

import { QUEUE_TYPE } from './constants';

//////////////////////////////////////////////////
//                                              //
//                 ACCOUNT DTOS                 //
//                                              //
//////////////////////////////////////////////////

export interface PlayerProfileDto {
    account: AccountDto;
    summoner: SummonerDto;
    ranked: {
        soloQ: RankedInfoDto | null;
        flexQ: RankedInfoDto | null;
    };
}

export interface AccountDto {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface SummonerDto {
    id: string;
    accountId: string;
    puuid: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface RankedInfoDto {
    leagueId: string;
    queueType: QUEUE_TYPE.RANKED_SOLO_5x5 | QUEUE_TYPE.RANKED_FLEX_SR;
    tier: string;
    rank: string;
    summonerId: string;
    puuid: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    veteran: boolean;
    inactive: boolean;
    freshBlood: boolean;
    hotStreak: boolean;
}

//////////////////////////////////////////////////
//                                              //
//                  GAME DTOS                   //
//                                              //
//////////////////////////////////////////////////

export interface ActiveGameDto {
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId: number;
    participants: ActiveGameParticipantDto[];
    observers: { encryptionKey: string };
    platformId: string;
    bannedChampions: { championId: number; teamId: number; pickTurn: number }[];
    gameStartTime: number;
    gameLength: number;
}

export interface ActiveGameParticipantDto {
    puuid: string;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    riotId: string;
    bot: boolean;
    summonerId: string;
    gameCustomizationObjects: any[];
    perks: {
        perkIds: number[];
        perkStyle: number;
        perkSubStyle: number;
    };
}

export interface MatchDto {
    metadata: {
        dataVersion: string;
        matchId: string;
        participants: string[]; // list of PUUIDs
    };

    info: {
        gameCreation: number;
        gameDuration: number;
        gameEndTimestamp: number;
        gameId: number;
        gameMode: string;
        gameName: string;
        gameStartTimestamp: number;
        gameType: string;
        gameVersion: string;
        mapId: number;
        platformId: string;
        queueId: number;
        tournamentCode: string;
        endOfGameResult: string;

        participants: MatchParticipantDto[];

        teams: {
            teamId: number;
            win: boolean;
            bans?: {
                championId: number;
                pickTurn: number;
            }[];
            objectives?: {
                baron: { first: boolean; kills: number };
                champion: { first: boolean; kills: number };
                dragon: { first: boolean; kills: number };
                inhibitor: { first: boolean; kills: number };
                riftHerald: { first: boolean; kills: number };
                tower: { first: boolean; kills: number };
            };
        }[];
    };
}

export interface MatchParticipantDto {
    puuid: string;
    summonerId: string;
    summonerName: string;
    riotIdGameName: string;
    riotIdTagline: string;

    championId: number;
    championName: string;
    champLevel: number;
    championTransform: number;

    kills: number;
    deaths: number;
    assists: number;
    win: boolean;
    teamId: number;
    teamPosition: string;
    individualPosition: string;
    role: string;
    placement: number;
    subteamPlacement: number;
    teamEarlySurrendered: boolean;

    goldEarned: number;
    goldSpent: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    physicalDamageDealt: number;
    magicDamageDealt: number;
    trueDamageDealt: number;
    physicalDamageDealtToChampions: number;
    magicDamageDealtToChampions: number;
    trueDamageDealtToChampions: number;
    damageSelfMitigated: number;
    totalHeal: number;
    totalHealsOnTeammates: number;
    totalUnitsHealed: number;
    totalDamageShieldedOnTeammates: number;
    damageDealtToObjectives: number;
    damageDealtToBuildings: number;
    damageDealtToTurrets: number;
    largestCriticalStrike: number;

    visionScore: number;
    visionWardsBoughtInGame: number;
    wardsPlaced: number;
    wardsKilled: number;
    detectorWardsPlaced: number;
    sightWardsBoughtInGame: number;

    summoner1Id: number;
    summoner2Id: number;
    summoner1Casts: number;
    summoner2Casts: number;

    spell1Casts: number;
    spell2Casts: number;
    spell3Casts: number;
    spell4Casts: number;

    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    itemsPurchased: number;

    timePlayed: number;
    totalTimeSpentDead: number;
    longestTimeSpentLiving: number;
    champExperience: number;

    perks: {
        statPerks: {
            defense: number;
            flex: number;
            offense: number;
        };
        styles: {
            description: string;
            style: number;
            selections: {
                perk: number;
                var1: number;
                var2: number;
                var3: number;
            }[];
        }[];
    };
}
