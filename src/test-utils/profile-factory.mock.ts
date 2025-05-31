// profileFactory.ts – helper to generate PlayerProfileDTOs with clean DX.
// -----------------------------------------------------------------------------
// Usage example (Jest):
// const profile = ProfileFactory.createPlayerProfileDTO({
//   summoner: { summonerLevel: 300 },
//   ranked: { soloQ: null },
// });
//
// You can also reset the internal counter between tests:
// ProfileFactory.resetIdTo(1);
// -----------------------------------------------------------------------------

import { QUEUE_TYPE } from '@features/riot/constants';
import { AccountDTO, PlayerProfileDTO, RankedInfoDTO, SummonerDTO } from '@features/riot/dtos';

export namespace ProfileFactory {
    let profileId = 1;

    export function nextId(): number {
        return profileId++;
    }

    export function resetIdTo(n: number): number {
        return (profileId = n);
    }

    export function createPlayerProfileDTO(overrides: Partial<PlayerProfileDTO> = {}): PlayerProfileDTO {
        const id = nextId();
        return {
            account: createAccountDTO({ puuid: `puuid-${id}`, ...overrides.account }),
            summoner: createSummonerDTO({ puuid: `puuid-${id}`, ...overrides.summoner }),
            ranked: {
                soloQ: createRankedInfoDTO({
                    puuid: `puuid-${id}`,
                    queueType: QUEUE_TYPE.RANKED_SOLO_5x5,
                    ...overrides.ranked?.soloQ,
                }),
                flexQ: createRankedInfoDTO({
                    puuid: `puuid-${id}`,
                    queueType: QUEUE_TYPE.RANKED_FLEX_SR,
                    ...overrides.ranked?.flexQ,
                }),
                ...overrides.ranked,
            },
        };
    }

    export function createAccountDTO(overrides: Partial<AccountDTO> = {}): AccountDTO {
        const id = nextId();
        return {
            puuid: `puuid-${id}`,
            gameName: `Player${id}`,
            tagLine: 'EUW',
            ...overrides,
        };
    }

    export function createSummonerDTO(overrides: Partial<SummonerDTO> = {}): SummonerDTO {
        const id = nextId();
        return {
            id: `summoner-${id}`,
            accountId: `account-${id}`,
            puuid: `puuid-${id}`,
            profileIconId: 1234,
            revisionDate: Date.now(),
            summonerLevel: 30 + id,
            ...overrides,
        };
    }

    export function createRankedInfoDTO(overrides: Partial<RankedInfoDTO> = {}): RankedInfoDTO {
        const id = nextId();
        return {
            leagueId: `league-${id}`,
            queueType: QUEUE_TYPE.RANKED_SOLO_5x5,
            tier: 'GOLD',
            rank: 'II',
            summonerId: `summoner-${id}`,
            puuid: `puuid-${id}`,
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
