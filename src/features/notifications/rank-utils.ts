export type RankedComparable = {
    tier?: string;
    rank?: string;
    leaguePoints?: number;
} | null;

const TIERS_ORDER = [
    'IRON',
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'EMERALD',
    'DIAMOND',
    'MASTER',
    'GRANDMASTER',
    'CHALLENGER',
];

const DIVISION_ORDER = ['IV', 'III', 'II', 'I'];

export class RankUtils {
    static lpDelta(before: RankedComparable, after: RankedComparable): number | null {
        if (!before?.leaguePoints || !after?.leaguePoints) return null;
        return after.leaguePoints - before.leaguePoints;
    }

    static compareRanks(before: RankedComparable, after: RankedComparable): number {
        if (!before || !after || !before.tier || !after.tier) return 0;

        const tierDelta = TIERS_ORDER.indexOf(after.tier) - TIERS_ORDER.indexOf(before.tier);
        if (tierDelta !== 0) return tierDelta;

        if (!before.rank || !after.rank) return 0;

        if (!this.isRankedTierWithDivisions(before.tier) || !this.isRankedTierWithDivisions(after.tier)) {
            return tierDelta;
        }

        const divisionDelta = DIVISION_ORDER.indexOf(after.rank) - DIVISION_ORDER.indexOf(before.rank);
        return divisionDelta;
    }

    static isPromotion(before: RankedComparable, after: RankedComparable): boolean {
        return this.compareRanks(before, after) > 0;
    }

    static isDemotion(before: RankedComparable, after: RankedComparable): boolean {
        return this.compareRanks(before, after) < 0;
    }

    static isRankedTierWithDivisions(tier: string): boolean {
        return ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'].includes(tier);
    }
}
