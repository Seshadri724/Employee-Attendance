import { User as UserIcon, Mail, Briefcase, Award } from 'lucide-react';
import { User } from '../../types';
import { useData } from '../../context/DataContext';

interface EmployeeTableProps {
  employees: User[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const { performance, attendance, allTasks } = useData();

  const getEmployeeData = (employeeId: string) => {
    const metrics = performance.find((m) => m.employeeId === employeeId);
    const employeeAttendance = attendance.filter((a) => a.employeeId === employeeId);
    const employeeTasks = allTasks.filter((t) => t.employeeId === employeeId);
    const todayAttendance = employeeAttendance.find(
      (a) => a.date === new Date().toISOString().split('T')[0]
    );

    return {
      metrics,
      todayAttendance,
      totalTasks: employeeTasks.length,
    };
  };

  const getStatusBadge = (status?: string) => {
    if (!status)
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Absent</span>;
    if (status === 'present')
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Present</span>;
    if (status === 'late')
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Late</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Absent</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Employee Overview</h3>
            <p className="text-sm text-gray-600">Live performance tracking ({employees.length} employees)</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Today Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tasks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((employee) => {
                const data = getEmployeeData(employee.id);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{employee.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {getStatusBadge(data.todayAttendance?.status)}
                        {data.todayAttendance && (
                          <div className="mt-1 text-xs text-gray-600">
                            {data.todayAttendance.checkIn} - {data.todayAttendance.checkOut || 'In progress'}
                            {data.todayAttendance.hoursWorked && (
                              <div className="text-xs text-gray-500">
                                {data.todayAttendance.hoursWorked}h worked
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-lg text-gray-900">
                          {data.metrics?.performanceScore || 0}
                        </span>
                        <span className="text-xs text-gray-500">/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${data.metrics?.attendanceRate || 0}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {data.metrics?.attendanceRate || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {data.metrics?.tasksCompleted || 0}
                        </p>
                        <p className="text-xs text-gray-600">completed</p>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <p className="text-sm">No employees found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
