import { BarChart3 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function PerformanceChart() {
  const { performance, users } = useData();
  
  const maxScore = performance.length > 0 
    ? Math.max(...performance.map((m) => m.performanceScore))
    : 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Comparison</h3>
          <p className="text-sm text-gray-600">
            Live performance tracking ({performance.length} employees)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {performance.length > 0 ? (
          performance.map((metric) => {
            const employee = users.find((u) => u.id === metric.employeeId);
            if (!employee) return null;

            const percentage = maxScore > 0 ? (metric.performanceScore / maxScore) * 100 : 0;
            const barColor =
              metric.performanceScore >= 90
                ? 'bg-green-500'
                : metric.performanceScore >= 75
                ? 'bg-blue-500'
                : metric.performanceScore >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500';

            return (
              <div key={metric.employeeId}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">
                        {employee.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{employee.name}</p>
                      <p className="text-xs text-gray-600">{employee.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {metric.performanceScore}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">/100</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${barColor} h-3 rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Attendance</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.attendanceRate}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Tasks</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.tasksCompleted}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Avg Hours</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.averageHoursWorked}h
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Streak</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.streak}d
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No performance data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Performance metrics will appear as employees use the system
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
