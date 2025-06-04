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
    static computeRankScore(rank: RankedComparable): number | null {
        if (!rank?.tier || !rank?.rank || rank.leaguePoints === undefined) return null;

        const tierIndex = TIERS_ORDER.indexOf(rank.tier);
        if (tierIndex === -1) return null;

        const base = tierIndex * 400; // 4 divisions * 100 LP per tier
        const divisionIndex = DIVISION_ORDER.indexOf(rank.rank);
        const divisionOffset = divisionIndex !== -1 ? (3 - divisionIndex) * 100 : 0;

        return base + divisionOffset + rank.leaguePoints;
    }

    static lpDelta(before: RankedComparable, after: RankedComparable): number | null {
        if (!before || !after) return null;
        if (before.leaguePoints === undefined || after.leaguePoints === undefined) return null;

        const promotion = this.isPromotion(before, after);
        const demotion = this.isDemotion(before, after);

        if (promotion) {
            return after.leaguePoints + (100 - before.leaguePoints);
        }

        if (demotion) {
            return after.leaguePoints - 100;
        }

        // Même tier + division
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

    static formatRank(tier?: string, rank?: string, lp?: number, delta?: number | null): string {
        if (!tier || !rank || lp == null) return 'Rank N/A';
        const deltaStr = delta != null && delta !== 0 ? ` (Δ = ${delta > 0 ? '+' : ''}${delta} LP)` : '';
        return `${tier} ${rank} ${lp} LP${deltaStr}`;
    }
}
