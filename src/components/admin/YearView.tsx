import { useMemo } from 'react';
import {
    AttendanceRecord,
    STATUS_COLORS,
    isWeekend,
    isHoliday,
    formatDate,
    getDaysInMonth,
} from '../../types/attendanceTypes';

interface YearViewProps {
    year: number;
    employeeId: string;
    records: AttendanceRecord[];
    onMonthClick: (month: number) => void;
}

export default function YearView({ year, records, onMonthClick }: YearViewProps) {
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const yearStats = useMemo(() => {
        const stats = {
            totalPresent: 0,
            totalAbsent: 0,
            totalLeave: 0,
            totalLate: 0,
            totalWorkingDays: 0,
        };

        const months = monthNames.map((name, monthIndex) => {
            const daysInMonth = getDaysInMonth(year, monthIndex);
            const monthStats = {
                present: 0,
                absent: 0,
                leave: 0,
                late: 0,
                halfDay: 0,
                workingDays: 0,
            };

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthIndex, day);
                const dateStr = formatDate(date);

                if (isWeekend(date) || isHoliday(dateStr)) continue;

                monthStats.workingDays++;
                stats.totalWorkingDays++;

                const record = records.find(r => r.date === dateStr);
                if (record) {
                    if (record.status === 'present') {
                        monthStats.present++;
                        stats.totalPresent++;
                    } else if (record.status === 'absent') {
                        monthStats.absent++;
                        stats.totalAbsent++;
                    } else if (record.status === 'leave') {
                        monthStats.leave++;
                        stats.totalLeave++;
                    } else if (record.status === 'late') {
                        monthStats.late++;
                        stats.totalLate++;
                    }
                }
            }

            return { name, ...monthStats };
        });

        return { months, ...stats };
    }, [year, records]);

    const attendancePercentage = yearStats.totalWorkingDays > 0
        ? Math.round((yearStats.totalPresent / yearStats.totalWorkingDays) * 100)
        : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <h3 className="text-lg font-semibold">Year Overview - {year}</h3>
                <p className="text-indigo-100 text-sm">Click any month to view details</p>
            </div>

            <div className="p-4 border-b bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{yearStats.totalPresent}</div>
                        <div className="text-sm text-gray-500">Present</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">{yearStats.totalAbsent}</div>
                        <div className="text-sm text-gray-500">Absent</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{yearStats.totalLeave}</div>
                        <div className="text-sm text-gray-500">Leave</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-amber-600">{yearStats.totalLate}</div>
                        <div className="text-sm text-gray-500">Late</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
                        <div className="text-sm text-gray-500">Attendance</div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {yearStats.months.map((month, index) => (
                        <button
                            key={month.name}
                            onClick={() => onMonthClick(index)}
                            className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left"
                        >
                            <div className="font-semibold text-gray-800 mb-2">{month.name}</div>

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                {month.workingDays > 0 && (
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                        style={{ width: `${(month.present / month.workingDays) * 100}%` }}
                                    />
                                )}
                            </div>

                            <div className="text-xs text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                    <span>Present:</span>
                                    <span className="font-medium text-green-600">{month.present}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Absent:</span>
                                    <span className="font-medium text-red-600">{month.absent}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Leave:</span>
                                    <span className="font-medium text-purple-600">{month.leave}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.present }} />
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.absent }} />
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.leave }} />
                        <span>Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.late }} />
                        <span>Late</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
