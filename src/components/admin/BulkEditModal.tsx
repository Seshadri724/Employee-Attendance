import { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { AttendanceStatus, STATUS_COLORS, STATUS_LABELS } from '../../types/attendanceTypes';

interface BulkEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (startDate: string, endDate: string, status: AttendanceStatus, excludeWeekends: boolean) => void;
    month: number;
    year: number;
}

export default function BulkEditModal({ isOpen, onClose, onApply, month, year }: BulkEditModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
    const [excludeWeekends, setExcludeWeekends] = useState(true);

    if (!isOpen) return null;

    const handleApply = () => {
        if (startDate && endDate && selectedStatus) {
            onApply(startDate, endDate, selectedStatus, excludeWeekends);
            onClose();
        }
    };

    const minDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const maxDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Bulk Edit Attendance
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Date Range */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={minDate}
                            max={maxDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || minDate}
                            max={maxDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Status Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status to Apply
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['present', 'absent', 'leave', 'late', 'half-day'] as AttendanceStatus[]).map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors ${selectedStatus === status
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: STATUS_COLORS[status] }}
                                />
                                <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
                                {selectedStatus === status && (
                                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={excludeWeekends}
                            onChange={(e) => setExcludeWeekends(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Exclude weekends (Sat, Sun)</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!startDate || !endDate}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply to Range
                    </button>
                </div>
            </div>
        </div>
    );
}
