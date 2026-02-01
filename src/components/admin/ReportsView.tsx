import { Download, Users, Calendar, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportToCSV } from '../../utils/exportUtils';

export default function ReportsView() {
    const { users, attendance, performance } = useData();
    const employees = users.filter((u) => u.role === 'employee');

    const handleExportAttendance = () => {
        const exportData = attendance.map((record) => {
            const employee = users.find((u) => u.id === record.employeeId);
            return {
                Date: record.date,
                Employee: employee?.name || 'Unknown',
                Department: employee?.department || 'N/A',
                'Check In': record.checkIn,
                'Check Out': record.checkOut || '-',
                Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
                'Hours Worked': record.hoursWorked || 0,
            };
        });

        exportToCSV(exportData, `Attendance_Report_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPerformance = () => {
        const exportData = performance.map((p) => {
            const employee = users.find((u) => u.id === p.employeeId);
            return {
                Employee: employee?.name || 'Unknown',
                Department: employee?.department || 'N/A',
                'Attendance Rate (%)': p.attendanceRate.toFixed(1),
                'Tasks Completed': p.tasksCompleted,
                'Avg Hours/Day': p.averageHoursWorked.toFixed(1),
                'Performance Score': p.performanceScore.toFixed(1),
                'Current Streak': p.streak,
            };
        });

        exportToCSV(exportData, `Performance_Report_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Reports & Analytics</h3>
                    <p className="text-sm text-gray-600">Export and analyze organization-wide data</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportAttendance}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Attendance
                    </button>
                    <button
                        onClick={handleExportPerformance}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Performance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Coverage</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">All departments reporting</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Tracking</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
                    <p className="text-sm text-gray-600">Total records tracked</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Efficiency</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {(performance.reduce((sum, p) => sum + p.attendanceRate, 0) / (performance.length || 1)).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Average attendance rate</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">Employee Performance Summary</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Avg Hours</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((emp) => {
                                const metric = performance.find((p) => p.employeeId === emp.id);
                                return (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{emp.name}</p>
                                            <p className="text-sm text-gray-500">{emp.department}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{ width: `${metric?.attendanceRate || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600">{metric?.attendanceRate.toFixed(0) || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{metric?.tasksCompleted || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{metric?.averageHoursWorked.toFixed(1) || 0}h</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${(metric?.performanceScore || 0) >= 90 ? 'bg-green-100 text-green-700' :
                                                    (metric?.performanceScore || 0) >= 80 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {metric?.performanceScore.toFixed(1) || 0}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
