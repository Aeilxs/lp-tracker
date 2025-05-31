import { QUEUE_TYPE } from '@features/riot/constants';
import { AccountDTO, MatchV5, RankedInfoDTO, SummonerDTO } from '@features/riot/dtos';
import { Match } from '@persistence/match/match.schema';
import deepmerge from 'deepmerge';

export namespace ProfileFactory {
    let profileId = 1;
    export function nextId(): number {
        return profileId++;
    }

    export function resetIdTo(n: number): number {
        return (profileId = n);
    }

    export function createAccountDTO(overrides: Partial<AccountDTO> = {}): AccountDTO {
        return {
            puuid: `puuid-${profileId}`,
            gameName: `Player${profileId}`,
            tagLine: 'EUW',
            ...overrides,
        };
    }

    export function createSummonerDTO(overrides: Partial<SummonerDTO> = {}): SummonerDTO {
        return {
            id: `summoner-${profileId}`,
            accountId: `account-${profileId}`,
            puuid: `puuid-${profileId}`,
            profileIconId: 1234,
            revisionDate: Date.now(),
            summonerLevel: 30 + profileId,
            ...overrides,
        };
    }

    export function createRankedInfoDTO(overrides: Partial<RankedInfoDTO> = {}): RankedInfoDTO {
        return {
            leagueId: `league-${profileId}`,
            queueType: QUEUE_TYPE.RANKED_SOLO_5x5,
            tier: 'GOLD',
            rank: 'II',
            summonerId: `summoner-${profileId}`,
            puuid: `puuid-${profileId}`,
            leaguePoints: 50,
            wins: 20,
            losses: 10,
            veteran: false,
            inactive: false,
            freshBlood: true,
            hotStreak: false,
            ...overrides,
        };
    }
}

export namespace MatchFactory {
    let matchId = 1;

    export function nextId(): number {
        return matchId++;
    }

    export function resetIdTo(n: number): number {
        return (matchId = n);
    }

    export function createMatchMetadataDTO(overrides?: Partial<MatchV5.MetadataDTO>): MatchV5.MetadataDTO {
        return {
            dataVersion: '2',
            matchId: `EUW1_${Date.now()}`,
            participants: Array.from({ length: 10 }, (_, i) => `puuid-${i + 1}`),
            ...overrides,
        };
    }

    export function createParticipantDTO(overrides?: Partial<MatchV5.ParticipantDTO>): MatchV5.ParticipantDTO {
        return deepmerge<MatchV5.ParticipantDTO>(
          {
            puuid: 'puuid-1',
            summonerName: 'Default',
            participantId: 1,
            summonerId: 'summoner-1',
            riotIdName: 'Default',
            riotIdTagline: 'EUW',
            summonerLevel: 300,
            championId: 157,
            championName: 'Yasuo',
            championTransform: 0,
            perks: {
              statPerks: { defense: 5001, flex: 5008, offense: 5008 },
              styles: [{
                description: 'primaryStyle',
                style: 8000,
                selections: [{ perk: 8005, var1: 1000, var2: 0, var3: 0 }],
              }],
            },
            assists: 5,
            baronKills: 0,
            bountyLevel: 1,
            champExperience: 12000,
            champLevel: 14,
            consumablesPurchased: 2,
            damageDealtToBuildings: 1000,
            damageDealtToObjectives: 1500,
            damageDealtToTurrets: 800,
            damageSelfMitigated: 4000,
            deaths: 3,
            detectorWardsPlaced: 1,
            doubleKills: 1,
            dragonKills: 0,
            firstBloodAssist: false,
            firstBloodKill: false,
            firstTowerAssist: false,
            firstTowerKill: false,
            gameEndedInEarlySurrender: false,
            gameEndedInSurrender: false,
            goldEarned: 11000,
            goldSpent: 10500,
            individualPosition: 'MIDDLE',
            inhibitorKills: 0,
            inhibitorTakedowns: 0,
            inhibitorsLost: 0,
            item0: 3031,
            item1: 3006,
            item2: 3046,
            item3: 3072,
            item4: 0,
            item5: 0,
            item6: 3363,
            itemsPurchased: 18,
            killingSprees: 2,
            kills: 6,
            lane: 'MIDDLE',
            largestCriticalStrike: 600,
            largestKillingSpree: 3,
            largestMultiKill: 2,
            longestTimeSpentLiving: 500,
            magicDamageDealt: 100,
            magicDamageDealtToChampions: 50,
            magicDamageTaken: 250,
            neutralMinionsKilled: 12,
            nexusKills: 0,
            nexusTakedowns: 1,
            nexusLost: 0,
            objectivesStolen: 0,
            objectivesStolenAssists: 0,
            pentaKills: 0,
            physicalDamageDealt: 15000,
            physicalDamageDealtToChampions: 14000,
            physicalDamageTaken: 5000,
            profileIcon: 1234,
            quadraKills: 0,
            role: 'SOLO',
            sightWardsBoughtInGame: 0,
            spell1Casts: 80,
            spell2Casts: 70,
            spell3Casts: 60,
            spell4Casts: 20,
            summoner1Casts: 4,
            summoner1Id: 4,
            summoner2Casts: 3,
            summoner2Id: 14,
            teamEarlySurrendered: false,
            teamId: 100,
            teamPosition: 'MIDDLE',
            timeCCingOthers: 15,
            timePlayed: 1800,
            totalDamageDealt: 15100,
            totalDamageDealtToChampions: 14100,
            totalDamageShieldedOnTeammates: 0,
            totalDamageTaken: 8000,
            totalHeal: 200,
            totalHealsOnTeammates: 0,
            totalMinionsKilled: 180,
            totalTimeCCDealt: 25,
            totalTimeSpentDead: 180,
            totalUnitsHealed: 1,
            tripleKills: 0,
            trueDamageDealt: 0,
            trueDamageDealtToChampions: 0,
            trueDamageTaken: 300,
            turretKills: 1,
            turretTakedowns: 2,
            turretsLost: 1,
            unrealKills: 0,
            visionScore: 20,
            visionWardsBoughtInGame: 1,
            wardsKilled: 3,
            wardsPlaced: 8,
            win: true,
          },
          overrides || {},
        );
      }
      

    export function createMatchInfoDTO(overrides?: Partial<MatchV5.InfoDTO>): MatchV5.InfoDTO {
        const now = Date.now();
        const base = {
            gameCreation: now - 10000,
            gameDuration: 1800,
            gameEndTimestamp: now,
            gameId: nextId(),
            gameMode: 'CLASSIC',
            gameName: `match-${matchId}`,
            gameStartTimestamp: now - 1800000,
            gameType: 'MATCHED_GAME',
            gameVersion: '13.10.456.1234',
            mapId: 11,
            platformId: 'EUW1',
            queueId: 420,
            tournamentCode: '',
            participants: ,
            teams: [
                {
                    teamId: 100,
                    win: true,
                    bans: [{ championId: 266, pickTurn: 1 }],
                    objectives: {
                        baron: { first: false, kills: 1 },
                        champion: { first: true, kills: 28 },
                        dragon: { first: true, kills: 3 },
                        inhibitor: { first: true, kills: 1 },
                        riftHerald: { first: true, kills: 1 },
                        tower: { first: true, kills: 7 },
                    },
                },
                {
                    teamId: 200,
                    win: false,
                    bans: [{ championId: 119, pickTurn: 2 }],
                    objectives: {
                        baron: { first: false, kills: 0 },
                        champion: { first: false, kills: 12 },
                        dragon: { first: false, kills: 1 },
                        inhibitor: { first: false, kills: 0 },
                        riftHerald: { first: false, kills: 0 },
                        tower: { first: false, kills: 3 },
                    },
                },
            ],
        };
        return deepmerge<MatchV5.InfoDTO>(base, overrides || {});
    }

    export function createMatchDTO(overrides?: Partial<MatchV5.MatchDTO>): MatchV5.MatchDTO {
        return deepmerge<MatchV5.MatchDTO>(
            {
                metadata: createMatchMetadataDTO(),
                info: createMatchInfoDTO(),
            },
            overrides || {},
        );
    }
}

const match = MatchFactory.createMatchDTO({
    info: {
        participants: [
            {
                ...MatchFactory.createMatchInfoDTO().participants[0],
                puuid: 'override-puuid',
                summonerName: 'Override',
                kills: 15,
                deaths: 1,
                assists: 10,
                win: true,
            },
        ],
    },
});
