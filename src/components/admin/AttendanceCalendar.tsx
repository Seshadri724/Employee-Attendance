import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    AttendanceStatus,
    AttendanceRecord,
    STATUS_COLORS,
    STATUS_LABELS,
    HOLIDAYS_2026,
    isWeekend,
    isHoliday,
    formatDate,
    getDaysInMonth,
    getMonthStartDay,
} from '../../types/attendanceTypes';

interface DateCellProps {
    date: Date;
    status: AttendanceStatus;
    isCurrentMonth: boolean;
    isToday: boolean;
    holidayName?: string;
    onClick: () => void;
}

function DateCell({ date, status, isCurrentMonth, isToday, holidayName, onClick }: DateCellProps) {
    const dayOfWeek = date.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

    return (
        <button
            onClick={onClick}
            disabled={!isCurrentMonth}
            className={`
        relative p-2 h-16 w-full border border-gray-100 transition-all duration-200
        ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-50'}
        ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isWeekendDay ? 'bg-gray-100' : ''}
      `}
        >
            <span className={`
        text-sm font-medium
        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
        ${isToday ? 'text-blue-600' : ''}
      `}>
                {date.getDate()}
            </span>

            {isCurrentMonth && status !== 'unmarked' && (
                <div className="mt-1 flex justify-center">
                    <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: STATUS_COLORS[status] }}
                        title={STATUS_LABELS[status]}
                    >
                        {status === 'present' && '✓'}
                        {status === 'absent' && '✗'}
                        {status === 'leave' && 'L'}
                        {status === 'late' && '!'}
                        {status === 'half-day' && '½'}
                        {status === 'holiday' && 'H'}
                        {status === 'weekend' && '-'}
                    </span>
                </div>
            )}

            {holidayName && (
                <div className="absolute bottom-0 left-0 right-0 bg-purple-100 text-purple-800 text-xs truncate px-1">
                    {holidayName}
                </div>
            )}
        </button>
    );
}

interface AttendanceCalendarProps {
    employeeId: string;
    employeeName: string;
    records: AttendanceRecord[];
    onUpdateRecord: (date: string, status: AttendanceStatus) => void;
}

export default function AttendanceCalendar({
    employeeId,
    employeeName,
    records,
    onUpdateRecord,
}: AttendanceCalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getMonthStartDay(currentYear, currentMonth);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getStatusForDate = useCallback((dateStr: string): AttendanceStatus => {
        const record = records.find(r => r.date === dateStr);
        if (record) return record.status;

        const date = new Date(dateStr);
        if (isWeekend(date)) return 'weekend';

        const holiday = isHoliday(dateStr);
        if (holiday) return 'holiday';

        return 'unmarked'; // No status yet - admin can mark it
    }, [records]);

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
    };

    const handleStatusChange = (status: AttendanceStatus) => {
        if (selectedDate) {
            onUpdateRecord(selectedDate, status);
            setSelectedDate(null);
        }
    };

    // Generate calendar grid
    const calendarDays: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(currentYear, currentMonth, day));
    }

    // Calculate summary
    const monthSummary = {
        present: 0,
        absent: 0,
        leave: 0,
        late: 0,
        halfDay: 0,
    };

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = formatDate(date);
        const status = getStatusForDate(dateStr);

        if (status === 'present') monthSummary.present++;
        else if (status === 'absent') monthSummary.absent++;
        else if (status === 'leave') monthSummary.leave++;
        else if (status === 'late') monthSummary.late++;
        else if (status === 'half-day') monthSummary.halfDay++;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Attendance Calendar</h3>
                        <p className="text-blue-100 text-sm">{employeeName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-medium min-w-[180px] text-center">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
                {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="h-16 bg-gray-50 border border-gray-100" />;
                    }

                    const dateStr = formatDate(date);
                    const status = getStatusForDate(dateStr);
                    const holiday = isHoliday(dateStr);
                    const isToday = dateStr === formatDate(today);

                    return (
                        <DateCell
                            key={dateStr}
                            date={date}
                            status={status}
                            isCurrentMonth={true}
                            isToday={isToday}
                            holidayName={holiday?.name}
                            onClick={() => handleDateClick(dateStr)}
                        />
                    );
                })}
            </div>

            {/* Summary */}
            <div className="p-4 border-t bg-gray-50">
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.present }} />
                        <span className="text-sm">Present: {monthSummary.present}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.absent }} />
                        <span className="text-sm">Absent: {monthSummary.absent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.leave }} />
                        <span className="text-sm">Leave: {monthSummary.leave}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.late }} />
                        <span className="text-sm">Late: {monthSummary.late}</span>
                    </div>
                </div>
            </div>

            {/* Status Edit Modal */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">
                            Edit Attendance - {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(['present', 'absent', 'leave', 'late', 'half-day'] as AttendanceStatus[]).map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="flex items-center gap-2 p-3 rounded-lg border-2 hover:border-gray-400 transition-colors"
                                    style={{ borderColor: STATUS_COLORS[status] }}
                                >
                                    <span
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: STATUS_COLORS[status] }}
                                    />
                                    <span className="font-medium">{STATUS_LABELS[status]}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="mt-4 w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
