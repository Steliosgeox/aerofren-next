export interface SelectUniqueUsersMetricInput {
    sysStatsUniqueUsersCount: number | null;
    chatUsersCount: number;
}

export interface SelectedUniqueUsersMetric {
    uniqueUsers: number;
    initialized: boolean;
    source: 'sys_stats' | 'chat_users' | 'uninitialized';
}

export function selectUniqueUsersMetric(
    input: SelectUniqueUsersMetricInput
): SelectedUniqueUsersMetric {
    if (typeof input.sysStatsUniqueUsersCount === 'number' && Number.isFinite(input.sysStatsUniqueUsersCount)) {
        return {
            uniqueUsers: Math.max(0, input.sysStatsUniqueUsersCount),
            initialized: true,
            source: 'sys_stats',
        };
    }

    if (typeof input.chatUsersCount === 'number' && input.chatUsersCount > 0) {
        return {
            uniqueUsers: input.chatUsersCount,
            initialized: true,
            source: 'chat_users',
        };
    }

    return {
        uniqueUsers: 0,
        initialized: false,
        source: 'uninitialized',
    };
}

