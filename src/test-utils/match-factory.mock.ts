/* eslint-disable @typescript-eslint/no-unsafe-return */

// matchFactory.ts - helper for mocking Riot MATCH‑V5 payloads in unit tests.
// -----------------------------------------------------------------------------
// Usage example (Jest):
// const match = MatchFactory.createMatchDTO({
//   info: MatchFactory.createInfoDTO({
//     participants: [MatchFactory.createParticipantDTO({ championName: 'Ahri' })]
//   })
// });
// expect(match.info.participants[0].championName).toBe('Ahri');
//
// The factory generates realistic defaults and lets you override any field
// via a strongly‑typed `overrides` argument.
// -----------------------------------------------------------------------------

import { QUEUE_ID } from '@features/riot/constants';
import { MatchV5 } from '@features/riot/dtos';
import * as deepmerge from 'deepmerge';

export namespace MatchFactory {
    /* ------------------------------------------------------------------------- */
    /*  Utilities                                                                */
    /* ------------------------------------------------------------------------- */
    const TEAM_SIZE = 5;
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomBool = () => Math.random() < 0.5;
    const randomElement = <T>(arr: readonly T[]): T => arr[randomInt(0, arr.length - 1)];
    const merge = <T>(base: T, overrides?: Partial<T>) =>
        overrides ? deepmerge(base, overrides, { arrayMerge: (_, s) => s }) : base;

    /*  Game constants for nicer variety                                        */
    const LANES = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'] as const;

    /* ------------------------------------------------------------------------- */
    /*  Entry points                                                             */
    /* ------------------------------------------------------------------------- */
    export function createMatchDTO(overrides: Partial<MatchV5.MatchDTO> = {}): MatchV5.MatchDTO {
        const base: MatchV5.MatchDTO = {
            metadata: createMetadataDTO(),
            info: createInfoDTO(),
        };
        return merge(base, overrides);
    }

    export function createMetadataDTO(overrides: Partial<MatchV5.MetadataDTO> = {}): MatchV5.MetadataDTO {
        const base: MatchV5.MetadataDTO = {
            dataVersion: '2',
            matchId: `EUW_${Date.now()}`,
            participants: Array.from({ length: TEAM_SIZE * 2 }, (_, i) => `puuid-${i + 1}`),
        };
        return merge(base, overrides);
    }

    export function createInfoDTO(overrides: Partial<MatchV5.InfoDTO> = {}): MatchV5.InfoDTO {
        const creation = Date.now() - randomInt(0, 86_400_000); // up to 24 h ago
        const durationSec = randomInt(15, 45) * 60; // 15‑45 min
        const startTimestamp = creation + randomInt(30_000, 90_000);
        const endTimestamp = startTimestamp + durationSec * 1000;

        const base: MatchV5.InfoDTO = {
            gameCreation: creation,
            gameDuration: durationSec,
            gameEndTimestamp: endTimestamp,
            gameId: Number(`${creation}${randomInt(100, 999)}`),
            gameMode: 'CLASSIC',
            gameName: `EUW_${creation}`,
            gameStartTimestamp: startTimestamp,
            gameType: 'MATCHED_GAME',
            gameVersion: '25.11.1',
            mapId: 11,
            participants: createParticipants(),
            platformId: 'EUW1',
            queueId: QUEUE_ID?.RANKED_SOLO_5x5 ?? 420,
            teams: createTeams(),
            tournamentCode: '',
        };

        return merge(base, overrides);
    }

    /* ------------------------------------------------------------------------- */
    /*  Participants                                                             */
    /* ------------------------------------------------------------------------- */
    export function createParticipants(
        overrides: Partial<MatchV5.ParticipantDTO> = {},
        count = TEAM_SIZE * 2,
    ): MatchV5.ParticipantDTO[] {
        return Array.from({ length: count }, (_, i) =>
            createParticipantDTO({ participantId: i + 1, teamId: i < TEAM_SIZE ? 100 : 200, ...overrides }),
        );
    }

    export function createParticipantDTO(overrides: Partial<MatchV5.ParticipantDTO> = {}): MatchV5.ParticipantDTO {
        const champId = randomInt(1, 200);
        const lane = randomElement(LANES);

        const base: MatchV5.ParticipantDTO = {
            assists: randomInt(0, 20),
            baronKills: randomInt(0, 2),
            bountyLevel: randomInt(0, 3),
            champExperience: randomInt(8000, 18000),
            champLevel: randomInt(10, 18),
            championId: champId,
            championName: `Champion${champId}`,
            championTransform: 0,
            consumablesPurchased: randomInt(0, 10),
            damageDealtToBuildings: randomInt(0, 20000),
            damageDealtToObjectives: randomInt(0, 50000),
            damageDealtToTurrets: randomInt(0, 20000),
            damageSelfMitigated: randomInt(0, 50000),
            deaths: randomInt(0, 15),
            detectorWardsPlaced: randomInt(0, 5),
            doubleKills: randomInt(0, 3),
            dragonKills: randomInt(0, 3),
            firstBloodAssist: randomBool(),
            firstBloodKill: randomBool(),
            firstTowerAssist: randomBool(),
            firstTowerKill: randomBool(),
            gameEndedInEarlySurrender: false,
            gameEndedInSurrender: false,
            goldEarned: randomInt(3000, 20000),
            goldSpent: randomInt(3000, 20000),
            individualPosition: lane,
            inhibitorKills: randomInt(0, 3),
            inhibitorTakedowns: randomInt(0, 3),
            inhibitorsLost: randomInt(0, 3),
            item0: randomInt(1000, 7000),
            item1: randomInt(0, 7000),
            item2: randomInt(0, 7000),
            item3: randomInt(0, 7000),
            item4: randomInt(0, 7000),
            item5: randomInt(0, 7000),
            item6: 3363,
            itemsPurchased: randomInt(0, 20),
            killingSprees: randomInt(0, 5),
            kills: randomInt(0, 30),
            lane,
            largestCriticalStrike: randomInt(0, 2000),
            largestKillingSpree: randomInt(0, 10),
            largestMultiKill: randomInt(1, 5),
            longestTimeSpentLiving: randomInt(0, 1200),
            magicDamageDealt: randomInt(0, 50000),
            magicDamageDealtToChampions: randomInt(0, 50000),
            magicDamageTaken: randomInt(0, 50000),
            neutralMinionsKilled: randomInt(0, 300),
            nexusKills: randomInt(0, 1),
            nexusTakedowns: randomInt(0, 1),
            nexusLost: 0,
            objectivesStolen: randomInt(0, 1),
            objectivesStolenAssists: randomInt(0, 1),
            participantId: 0,
            pentaKills: randomInt(0, 1),
            perks: createPerksDTO(),
            physicalDamageDealt: randomInt(0, 70000),
            physicalDamageDealtToChampions: randomInt(0, 70000),
            physicalDamageTaken: randomInt(0, 70000),
            profileIcon: randomInt(0, 6000),
            puuid: `puuid-${crypto.randomUUID?.() ?? randomInt(1, 10_000_000)}`,
            quadraKills: randomInt(0, 2),
            riotIdName: '',
            riotIdTagline: '',
            role: 'SOLO',
            sightWardsBoughtInGame: randomInt(0, 5),
            spell1Casts: randomInt(0, 200),
            spell2Casts: randomInt(0, 200),
            spell3Casts: randomInt(0, 200),
            spell4Casts: randomInt(0, 200),
            summoner1Casts: randomInt(0, 20),
            summoner1Id: randomInt(1, 40),
            summoner2Casts: randomInt(0, 20),
            summoner2Id: randomInt(1, 40),
            summonerId: `summoner-${crypto.randomUUID?.() ?? randomInt(1, 10_000_000)}`,
            summonerLevel: randomInt(30, 800),
            summonerName: `Summoner${randomInt(1, 10000)}`,
            teamEarlySurrendered: false,
            teamId: 100,
            teamPosition: lane,
            timeCCingOthers: randomInt(0, 300),
            timePlayed: randomInt(900, 2700),
            totalDamageDealt: randomInt(1000, 150000),
            totalDamageDealtToChampions: randomInt(0, 100000),
            totalDamageShieldedOnTeammates: randomInt(0, 20000),
            totalDamageTaken: randomInt(0, 100000),
            totalHeal: randomInt(0, 30000),
            totalHealsOnTeammates: randomInt(0, 20000),
            totalMinionsKilled: randomInt(0, 400),
            totalTimeCCDealt: randomInt(0, 1000),
            totalTimeSpentDead: randomInt(0, 1000),
            totalUnitsHealed: randomInt(0, 5),
            tripleKills: randomInt(0, 5),
            trueDamageDealt: randomInt(0, 50000),
            trueDamageDealtToChampions: randomInt(0, 50000),
            trueDamageTaken: randomInt(0, 30000),
            turretKills: randomInt(0, 10),
            turretTakedowns: randomInt(0, 10),
            turretsLost: randomInt(0, 10),
            unrealKills: randomInt(0, 1),
            visionScore: randomInt(0, 100),
            visionWardsBoughtInGame: randomInt(0, 10),
            wardsKilled: randomInt(0, 20),
            wardsPlaced: randomInt(0, 30),
            win: randomBool(),
        };

        return merge(base, overrides);
    }

    /* ------------------------------------------------------------------------- */
    /*  Perks                                                                    */
    /* ------------------------------------------------------------------------- */
    export function createPerksDTO(overrides: Partial<MatchV5.PerksDTO> = {}): MatchV5.PerksDTO {
        const base: MatchV5.PerksDTO = {
            statPerks: {
                defense: randomInt(5000, 5008),
                flex: randomInt(5000, 5008),
                offense: randomInt(5000, 5008),
            },
            styles: [
                createPerkStyleDTO({ description: 'primaryStyle' }),
                createPerkStyleDTO({ description: 'secondaryStyle' }),
            ],
        };
        return merge(base, overrides);
    }

    export function createPerkStyleDTO(overrides: Partial<MatchV5.PerkStyleDTO> = {}): MatchV5.PerkStyleDTO {
        const base: MatchV5.PerkStyleDTO = {
            description: 'primaryStyle',
            selections: Array.from({ length: 4 }, () => ({
                perk: randomInt(8000, 8500),
                var1: randomInt(0, 500),
                var2: randomInt(0, 500),
                var3: randomInt(0, 500),
            })),
            style: randomInt(8000, 8500),
        };
        return merge(base, overrides);
    }

    /* ------------------------------------------------------------------------- */
    /*  Teams & objectives                                                       */
    /* ------------------------------------------------------------------------- */
    export function createTeams(overrides: Partial<MatchV5.TeamDTO>[] = []): MatchV5.TeamDTO[] {
        const base: MatchV5.TeamDTO[] = [100, 200].map<MatchV5.TeamDTO>((teamId) => ({
            bans: Array.from({ length: 5 }, (_, i) => ({
                championId: randomInt(1, 200),
                pickTurn: i + 1,
            })),
            objectives: createObjectivesDTO(),
            teamId,
            win: teamId === 100,
        }));

        overrides.forEach((ov, i) => {
            if (ov) base[i] = merge(base[i], ov);
        });

        return base;
    }

    export function createObjectivesDTO(overrides: Partial<MatchV5.ObjectivesDTO> = {}): MatchV5.ObjectivesDTO {
        const base: MatchV5.ObjectivesDTO = {
            baron: createObjectiveDTO(),
            champion: createObjectiveDTO(),
            dragon: createObjectiveDTO(),
            inhibitor: createObjectiveDTO(),
            riftHerald: createObjectiveDTO(),
            tower: createObjectiveDTO(),
        };
        return merge(base, overrides);
    }

    export function createObjectiveDTO(overrides: Partial<MatchV5.ObjectiveDTO> = {}): MatchV5.ObjectiveDTO {
        const base: MatchV5.ObjectiveDTO = {
            first: randomBool(),
            kills: randomInt(0, 10),
        };
        return merge(base, overrides);
    }
}
