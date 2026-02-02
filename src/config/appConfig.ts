// Application configuration
// These values can be customized per deployment

export const APP_CONFIG = {
    // Work schedule configuration
    WORK_START_HOUR: 9,      // 9 AM - Used to determine "late" status
    WORK_START_MINUTE: 0,    // 0 minutes past the hour

    // Weekend configuration (0 = Sunday, 6 = Saturday)
    WEEKEND_DAYS: [0, 6] as number[],

    // Company info
    COMPANY_NAME: 'CARIVIX',

    // Demo mode
    SHOW_DEMO_CREDENTIALS: true,
};

// Helper functions
export function isWeekend(date: Date): boolean {
    return APP_CONFIG.WEEKEND_DAYS.includes(date.getDay());
}

export function isLateCheckIn(date: Date): boolean {
    return (
        date.getHours() > APP_CONFIG.WORK_START_HOUR ||
        (date.getHours() === APP_CONFIG.WORK_START_HOUR && date.getMinutes() > APP_CONFIG.WORK_START_MINUTE)
    );
}
