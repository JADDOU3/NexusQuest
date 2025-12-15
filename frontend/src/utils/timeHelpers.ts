// Time-related utility functions

/**
 * Format relative time (e.g., "2m ago", "3h ago")
 * Used for version control and activity timestamps
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

/**
 * Calculate time difference in a human-readable format
 */
export function getTimeDifference(startDate: Date, endDate: Date = new Date()): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
} {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    return {
        days: diffDays,
        hours: diffHours % 24,
        minutes: diffMins % 60,
        seconds: diffSecs % 60,
    };
}
