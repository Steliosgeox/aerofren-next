import { selectUniqueUsersMetric } from '@/lib/admin/stats-utils';

describe('selectUniqueUsersMetric', () => {
    it('uses sys_stats when uniqueUsersCount is present', () => {
        const result = selectUniqueUsersMetric({
            sysStatsUniqueUsersCount: 42,
            chatUsersCount: 10,
        });

        expect(result).toEqual({
            uniqueUsers: 42,
            initialized: true,
            source: 'sys_stats',
        });
    });

    it('falls back to chatUsers count when sys_stats is missing', () => {
        const result = selectUniqueUsersMetric({
            sysStatsUniqueUsersCount: null,
            chatUsersCount: 7,
        });

        expect(result).toEqual({
            uniqueUsers: 7,
            initialized: true,
            source: 'chat_users',
        });
    });

    it('marks metric uninitialized when both sources are missing', () => {
        const result = selectUniqueUsersMetric({
            sysStatsUniqueUsersCount: null,
            chatUsersCount: 0,
        });

        expect(result).toEqual({
            uniqueUsers: 0,
            initialized: false,
            source: 'uninitialized',
        });
    });
});
