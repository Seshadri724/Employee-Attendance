/**
 * Attendance Types for Admin Calendar Management
 */

export type AttendanceStatus =
    | 'present'
    | 'absent'
    | 'leave'
    | 'late'
    | 'half-day'
    | 'holiday'
    | 'weekend'
    | 'unmarked';

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD format
    status: AttendanceStatus;
    checkIn?: string; // HH:MM format
    checkOut?: string; // HH:MM format
    notes?: string;
    markedBy?: string; // Admin who marked it
    createdAt: string;
    updatedAt: string;
}

export interface Holiday {
    date: string; // YYYY-MM-DD format
    name: string;
    type: 'national' | 'regional' | 'company';
}

export interface MonthSummary {
    present: number;
    absent: number;
    leave: number;
    late: number;
    halfDay: number;
    holidays: number;
    workingDays: number;
}

export interface YearSummary {
    months: { [month: string]: MonthSummary };
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
    attendancePercentage: number;
}

// Status colors for UI
export const STATUS_COLORS: Record<AttendanceStatus, string> = {
    present: '#22c55e',   // green
    absent: '#ef4444',    // red
    leave: '#a855f7',     // purple
    late: '#f59e0b',      // amber
    'half-day': '#3b82f6', // blue
    holiday: '#6b7280',   // gray
    weekend: '#d1d5db',   // light gray
    unmarked: '#e5e7eb',  // lighter gray (no status)
};

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
    present: 'Present',
    absent: 'Absent',
    leave: 'Leave',
    late: 'Late',
    'half-day': 'Half Day',
    holiday: 'Holiday',
    weekend: 'Weekend',
    unmarked: 'Not Marked',
};

// Indian National Holidays 2026
export const HOLIDAYS_2026: Holiday[] = [
    { date: '2026-01-26', name: 'Republic Day', type: 'national' },
    { date: '2026-03-10', name: 'Holi', type: 'national' },
    { date: '2026-04-02', name: 'Ram Navami', type: 'national' },
    { date: '2026-04-14', name: 'Ambedkar Jayanti', type: 'national' },
    { date: '2026-05-01', name: 'May Day', type: 'national' },
    { date: '2026-08-15', name: 'Independence Day', type: 'national' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2026-10-20', name: 'Dussehra', type: 'national' },
    { date: '2026-11-09', name: 'Diwali', type: 'national' },
    { date: '2026-12-25', name: 'Christmas', type: 'national' },
];

// Helper functions
export function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

export function isHoliday(dateStr: string, holidays: Holiday[] = HOLIDAYS_2026): Holiday | undefined {
    return holidays.find(h => h.date === dateStr);
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getMonthStartDay(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}
