import { useState, useCallback } from 'react';
import { Calendar, Users, ChevronDown, Edit3, Download, LayoutGrid, CalendarDays } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';
import YearView from './YearView';
import BulkEditModal from './BulkEditModal';
import {
    AttendanceRecord,
    AttendanceStatus,
    formatDate,
    isWeekend,
    isHoliday,
} from '../../types/attendanceTypes';

// Mock employees (replace with actual data from your store)
const MOCK_EMPLOYEES = [
    { id: '1', name: 'John Smith', department: 'Engineering' },
    { id: '2', name: 'Sarah Johnson', department: 'Design' },
    { id: '3', name: 'Mike Chen', department: 'Marketing' },
    { id: '4', name: 'Emily Davis', department: 'HR' },
    { id: '5', name: 'Seshu', department: 'Engineering' },
];

export default function AttendanceManagement() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(MOCK_EMPLOYEES[0].id);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    // Attendance records state (would come from Supabase in production)
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    const selectedEmployee = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);

    const handleUpdateRecord = useCallback((date: string, status: AttendanceStatus) => {
        setRecords(prev => {
            const existingIndex = prev.findIndex(r => r.date === date && r.employeeId === selectedEmployeeId);

            if (existingIndex >= 0) {
                // Update existing record
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    status,
                    updatedAt: new Date().toISOString(),
                };
                return updated;
            } else {
                // Create new record
                return [...prev, {
                    id: `${Date.now()}`,
                    employeeId: selectedEmployeeId,
                    date,
                    status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }];
            }
        });
    }, [selectedEmployeeId]);

    const handleBulkEdit = useCallback((
        startDate: string,
        endDate: string,
        status: AttendanceStatus,
        excludeWeekends: boolean
    ) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const newRecords: AttendanceRecord[] = [];
        const current = new Date(start);

        while (current <= end) {
            const dateStr = formatDate(current);

            // Skip weekends if option is enabled
            if (excludeWeekends && isWeekend(current)) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // Skip holidays
            if (isHoliday(dateStr)) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            newRecords.push({
                id: `${Date.now()}-${dateStr}`,
                employeeId: selectedEmployeeId,
                date: dateStr,
                status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            current.setDate(current.getDate() + 1);
        }

        setRecords(prev => {
            // Remove existing records for these dates
            const filtered = prev.filter(r =>
                r.employeeId !== selectedEmployeeId ||
                !newRecords.some(nr => nr.date === r.date)
            );
            return [...filtered, ...newRecords];
        });
    }, [selectedEmployeeId]);

    const employeeRecords = records.filter(r => r.employeeId === selectedEmployeeId);

    const handleExport = () => {
        // Create CSV content
        const headers = ['Date', 'Status', 'Check In', 'Check Out', 'Notes'];
        const rows = employeeRecords.map(r => [
            r.date,
            r.status,
            r.checkIn || '',
            r.checkOut || '',
            r.notes || ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedEmployee?.name}_${currentYear}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-blue-600" />
                        Attendance Management
                    </h2>
                    <p className="text-gray-500 mt-1">View and edit employee attendance records</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBulkEdit(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        Bulk Edit
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Employee Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
                        >
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="flex-1 text-left">
                                {selectedEmployee?.name || 'Select Employee'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {showEmployeeDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                                {MOCK_EMPLOYEES.map(employee => (
                                    <button
                                        key={employee.id}
                                        onClick={() => {
                                            setSelectedEmployeeId(employee.id);
                                            setShowEmployeeDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${employee.id === selectedEmployeeId ? 'bg-blue-50 text-blue-700' : ''
                                            }`}
                                    >
                                        <div className="font-medium">{employee.name}</div>
                                        <div className="text-xs text-gray-500">{employee.department}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Selector */}
                    <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {[2024, 2025, 2026, 2027].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('year')}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors ${viewMode === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Year
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'month' ? (
                <AttendanceCalendar
                    employeeId={selectedEmployeeId}
                    employeeName={selectedEmployee?.name || ''}
                    records={employeeRecords}
                    onUpdateRecord={handleUpdateRecord}
                />
            ) : (
                <YearView
                    year={currentYear}
                    employeeId={selectedEmployeeId}
                    records={employeeRecords}
                    onMonthClick={(month) => {
                        setCurrentMonth(month);
                        setViewMode('month');
                    }}
                />
            )}

            {/* Bulk Edit Modal */}
            <BulkEditModal
                isOpen={showBulkEdit}
                onClose={() => setShowBulkEdit(false)}
                onApply={handleBulkEdit}
                month={currentMonth}
                year={currentYear}
            />
        </div>
    );
}
