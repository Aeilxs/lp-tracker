/**
 * @file src/core/riot/dtos.ts
 */

import { QUEUE_TYPE } from './constants';

////////////////////////////////////////////////////
///                                              ///
///                 ACCOUNT DTOS                 ///
///                                              ///
////////////////////////////////////////////////////

export interface PlayerProfileDTO {
    account: AccountDTO;
    summoner: SummonerDTO;
    ranked: {
        soloQ: RankedInfoDTO | null;
        flexQ: RankedInfoDTO | null;
    };
}

export interface AccountDTO {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface SummonerDTO {
    id: string;
    accountId: string;
    puuid: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface RankedInfoDTO {
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

////////////////////////////////////////////////////
///                                              ///
///                  GAME DTOS                   ///
///                                              ///
////////////////////////////////////////////////////

export interface ActiveGameDTO {
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId: number;
    participants: ActiveGameParticipantDTO[];
    observers: { encryptionKey: string };
    platformId: string;
    bannedChampions: { championId: number; teamId: number; pickTurn: number }[];
    gameStartTime: number;
    gameLength: number;
}

export interface ActiveGameParticipantDTO {
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

export namespace MatchV5 {
    /** Match Data Transfer Object from the MATCH-V5 Riot API */
    export interface MatchDTO {
        metadata: MetadataDTO; // Match metadata.
        info: InfoDTO; // Match info.
    }

    /** Metadata Data Transfer Object from the MATCH-V5 Riot API */
    export interface MetadataDTO {
        dataVersion: string; // Match data version.
        matchId: string; // Match id.
        participants: string[]; // A list of participant PUUIDs.
    }

    /** Info Data Transfer Object from the MATCH-V5 Riot API */
    export interface InfoDTO {
        gameCreation: number; // Unix timestamp for when the game is created on the game server (i.e., the loading screen).
        gameDuration: number; // Prior to patch 11.20, this field returns the game length in milliseconds calculated from gameEndTimestamp - gameStartTimestamp. Post patch 11.20, this field returns the max timePlayed of any participant in the game in seconds, which makes the behavior of this field consistent with that of match-v4. The best way to handling the change in this field is to treat the value as milliseconds if the gameEndTimestamp field isn't in the response and to treat the value as seconds if gameEndTimestamp is in the response.
        gameEndTimestamp: number; // Unix timestamp for when match ends on the game server. This timestamp can occasionally be significantly longer than when the match "ends". The most reliable way of determining the timestamp for the end of the match would be to add the max time played of any participant to the gameStartTimestamp. This field was added to match-v5 in patch 11.20 on Oct 5th, 2021.
        gameId: number;
        gameMode: string; // Refer to the Game Constants documentation.
        gameName: string;
        gameStartTimestamp: number; // Unix timestamp for when match starts on the game server.
        gameType: string; // matchmaking logic ("MATCHED_GAME", "CUSTOM_GAME" ...)
        gameVersion: string; // The first two parts can be used to determine the patch a game was played on.
        mapId: number; // Refer to the Game Constants documentation.
        participants: ParticipantDTO[];
        platformId: string; // Platform where the match was played.
        queueId: number; // Refer to the Game Constants documentation.
        teams: TeamDTO[];
        tournamentCode: string; // Tournament code used to generate the match. This field was added to match-v5 in patch 11.13 on June 23rd, 2021.
    }

    /** Participant Data Transfer Object from the MATCH-V5 Riot API */
    export interface ParticipantDTO {
        assists: number;
        baronKills: number;
        bountyLevel: number;
        champExperience: number;
        champLevel: number;
        championId: number; // Prior to patch 11.4, on Feb 18th, 2021, this field returned invalid championIds. We recommend determining the champion based on the championName field for matches played prior to patch 11.4.
        championName: string;
        championTransform: number; // This field is currently only utilized for Kayn's transformations. (Legal values: 0 - None, 1 - Slayer, 2 - Assassin)
        consumablesPurchased: number;
        damageDealtToBuildings: number;
        damageDealtToObjectives: number;
        damageDealtToTurrets: number;
        damageSelfMitigated: number;
        deaths: number;
        detectorWardsPlaced: number;
        doubleKills: number;
        dragonKills: number;
        firstBloodAssist: boolean;
        firstBloodKill: boolean;
        firstTowerAssist: boolean;
        firstTowerKill: boolean;
        gameEndedInEarlySurrender: boolean;
        gameEndedInSurrender: boolean;
        goldEarned: number;
        goldSpent: number;
        individualPosition: string; // Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
        inhibitorKills: number;
        inhibitorTakedowns: number;
        inhibitorsLost: number;
        item0: number;
        item1: number;
        item2: number;
        item3: number;
        item4: number;
        item5: number;
        item6: number;
        itemsPurchased: number;
        killingSprees: number;
        kills: number;
        lane: string;
        largestCriticalStrike: number;
        largestKillingSpree: number;
        largestMultiKill: number;
        longestTimeSpentLiving: number;
        magicDamageDealt: number;
        magicDamageDealtToChampions: number;
        magicDamageTaken: number;
        neutralMinionsKilled: number;
        nexusKills: number;
        nexusTakedowns: number;
        nexusLost: number;
        objectivesStolen: number;
        objectivesStolenAssists: number;
        participantId: number;
        pentaKills: number;
        perks: PerksDTO;
        physicalDamageDealt: number;
        physicalDamageDealtToChampions: number;
        physicalDamageTaken: number;
        profileIcon: number;
        puuid: string;
        quadraKills: number;
        riotIdName: string;
        riotIdTagline: string;
        role: string;
        sightWardsBoughtInGame: number;
        spell1Casts: number;
        spell2Casts: number;
        spell3Casts: number;
        spell4Casts: number;
        summoner1Casts: number;
        summoner1Id: number;
        summoner2Casts: number;
        summoner2Id: number;
        summonerId: string;
        summonerLevel: number;
        summonerName: string;
        teamEarlySurrendered: boolean;
        teamId: number;
        teamPosition: string; // Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
        timeCCingOthers: number;
        timePlayed: number;
        totalDamageDealt: number;
        totalDamageDealtToChampions: number;
        totalDamageShieldedOnTeammates: number;
        totalDamageTaken: number;
        totalHeal: number;
        totalHealsOnTeammates: number;
        totalMinionsKilled: number;
        totalTimeCCDealt: number;
        totalTimeSpentDead: number;
        totalUnitsHealed: number;
        tripleKills: number;
        trueDamageDealt: number;
        trueDamageDealtToChampions: number;
        trueDamageTaken: number;
        turretKills: number;
        turretTakedowns: number;
        turretsLost: number;
        unrealKills: number;
        visionScore: number;
        visionWardsBoughtInGame: number;
        wardsKilled: number;
        wardsPlaced: number;
        win: boolean;
    }

    /** Perks Data Transfer Object from the MATCH-V5 Riot API */
    export interface PerksDTO {
        statPerks: PerkStatsDTO;
        styles: PerkStyleDTO[];
    }

    /** Perk Stats Data Transfer Object from the MATCH-V5 Riot API */
    export interface PerkStatsDTO {
        defense: number;
        flex: number;
        offense: number;
    }

    /** Perk Style Data Transfer Object from the MATCH-V5 Riot API */
    export interface PerkStyleDTO {
        description: string;
        selections: PerkStyleSelectionDTO[];
        style: number;
    }

    /** Perk Style Selection Data Transfer Object from the MATCH-V5 Riot API */
    export interface PerkStyleSelectionDTO {
        perk: number;
        var1: number;
        var2: number;
        var3: number;
    }

    /** Team Data Transfer Object from the MATCH-V5 Riot API */
    export interface TeamDTO {
        bans: BanDTO[];
        objectives: ObjectivesDTO;
        teamId: number;
        win: boolean;
    }

    /** Ban Data Transfer Object from the MATCH-V5 Riot API */
    export interface BanDTO {
        championId: number;
        pickTurn: number;
    }

    /** Objectives Data Transfer Object from the MATCH-V5 Riot API */
    export interface ObjectivesDTO {
        baron: ObjectiveDTO;
        champion: ObjectiveDTO;
        dragon: ObjectiveDTO;
        inhibitor: ObjectiveDTO;
        riftHerald: ObjectiveDTO;
        tower: ObjectiveDTO;
    }

    /** Objective Data Transfer Object from the MATCH-V5 Riot API */
    export interface ObjectiveDTO {
        first: boolean;
        kills: number;
    }
}
