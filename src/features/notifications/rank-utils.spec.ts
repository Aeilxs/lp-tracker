import { RankUtils, RankedComparable } from './rank-utils';

describe('RankUtils', () => {
    describe('lpDelta', () => {
        it('returns null if either before or after is null', () => {
            expect(RankUtils.lpDelta(null, { leaguePoints: 50 })).toBeNull();
            expect(RankUtils.lpDelta({ leaguePoints: 50 }, null)).toBeNull();
        });

        it('calculates the correct delta', () => {
            expect(RankUtils.lpDelta({ leaguePoints: 50 }, { leaguePoints: 75 })).toBe(25);
            expect(RankUtils.lpDelta({ leaguePoints: 100 }, { leaguePoints: 20 })).toBe(-80);
        });
    });

    describe('compareRanks', () => {
        it('returns 0 if any input is null or incomplete', () => {
            expect(RankUtils.compareRanks(null, null)).toBe(0);
            expect(
                RankUtils.compareRanks({ tier: 'GOLD', rank: 'IV' }, { tier: 'PLATINUM', rank: 'IV' }),
            ).toBeGreaterThan(0);
        });

        it('compares tiers correctly', () => {
            expect(
                RankUtils.compareRanks({ tier: 'GOLD', rank: 'I' }, { tier: 'PLATINUM', rank: 'IV' }),
            ).toBeGreaterThan(0);

            expect(RankUtils.compareRanks({ tier: 'DIAMOND', rank: 'I' }, { tier: 'EMERALD', rank: 'I' })).toBeLessThan(
                0,
            );
        });

        it('compares ranks within the same tier', () => {
            expect(RankUtils.compareRanks({ tier: 'GOLD', rank: 'IV' }, { tier: 'GOLD', rank: 'I' })).toBeGreaterThan(
                0,
            );
        });

        it('ignores division comparison if tier has no divisions', () => {
            expect(
                RankUtils.compareRanks({ tier: 'MASTER', rank: 'I' }, { tier: 'GRANDMASTER', rank: 'I' }),
            ).toBeGreaterThan(0);
        });
    });

    describe('isPromotion / isDemotion', () => {
        const base: RankedComparable = { tier: 'GOLD', rank: 'IV', leaguePoints: 0 };

        it('detects promotion', () => {
            const after = { tier: 'GOLD', rank: 'III', leaguePoints: 10 };
            expect(RankUtils.isPromotion(base, after)).toBe(true);
        });

        it('detects demotion', () => {
            const after = { tier: 'GOLD', rank: 'IV', leaguePoints: 0 };
            const before = { tier: 'GOLD', rank: 'III', leaguePoints: 10 };
            expect(RankUtils.isDemotion(before, after)).toBe(true);
        });

        it('handles tier promotions/demotions', () => {
            expect(RankUtils.isPromotion({ tier: 'GOLD', rank: 'I' }, { tier: 'PLATINUM', rank: 'IV' })).toBe(true);

            expect(RankUtils.isDemotion({ tier: 'PLATINUM', rank: 'IV' }, { tier: 'GOLD', rank: 'I' })).toBe(true);
        });
    });
});
