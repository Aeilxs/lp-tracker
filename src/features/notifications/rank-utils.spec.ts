import { RankUtils, RankedComparable } from './rank-utils';

describe('RankUtils', () => {
    describe('lpDelta', () => {
        it('returns null if either before or after is null', () => {
            console.log('Case: null input');
            expect(RankUtils.lpDelta(null, { leaguePoints: 50, tier: 'GOLD', rank: 'IV' })).toBeNull();
            expect(RankUtils.lpDelta({ leaguePoints: 50, tier: 'GOLD', rank: 'IV' }, null)).toBeNull();
        });

        it('calculates the correct delta within same rank', () => {
            const before = { tier: 'GOLD', rank: 'IV', leaguePoints: 50 };
            const after = { tier: 'GOLD', rank: 'IV', leaguePoints: 75 };
            const delta = RankUtils.lpDelta(before, after);
            // console.log('Same rank:', before, after, '→ delta =', delta);
            // console.log('Formatted:', RankUtils.formatRank(after.tier, after.rank, after.leaguePoints, delta));
            expect(delta).toBe(25);

            const b2 = { tier: 'GOLD', rank: 'IV', leaguePoints: 100 };
            const a2 = { tier: 'GOLD', rank: 'IV', leaguePoints: 20 };
            const delta2 = RankUtils.lpDelta(b2, a2);
            // console.log('Same rank loss:', b2, a2, '→ delta =', delta2);
            // console.log('Formatted:', RankUtils.formatRank(a2.tier, a2.rank, a2.leaguePoints, delta2));
            expect(delta2).toBe(-80);
        });

        it('returns LP delta relative to 100 on tier change (demotion)', () => {
            const before = { tier: 'DIAMOND', rank: 'IV', leaguePoints: 10 };
            const after = { tier: 'EMERALD', rank: 'I', leaguePoints: 90 };
            const delta = RankUtils.lpDelta(before, after);
            // console.log('Demotion:', before, after, '→ delta =', delta);
            // console.log('Formatted:', RankUtils.formatRank(after.tier, after.rank, after.leaguePoints, delta));
            expect(delta).toBe(-10);
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
            expect(
                RankUtils.isPromotion(
                    { tier: 'GOLD', rank: 'I', leaguePoints: 100 },
                    { tier: 'PLATINUM', rank: 'IV', leaguePoints: 0 },
                ),
            ).toBe(true);

            expect(
                RankUtils.isDemotion(
                    { tier: 'PLATINUM', rank: 'IV', leaguePoints: 0 },
                    { tier: 'GOLD', rank: 'I', leaguePoints: 75 },
                ),
            ).toBe(true);
        });
    });
});
