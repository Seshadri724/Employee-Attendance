import { useState, useEffect } from 'react';
import {
  LogOut,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  ClipboardList,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import CheckInOut from './employee/CheckInOut';
import TaskSubmission from './employee/TaskSubmission';
import PerformanceCard from './employee/PerformanceCard';
import SupportChatbot from './SupportChatbot';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { allTasks, performance } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userTasks = allTasks.filter((t) => t.employeeId === user?.id);
  const userMetrics = performance.find((m) => m.employeeId === user?.id);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayTasks = userTasks.filter(task => task.date === todayDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CARIVIX</h1>
                <p className="text-xs text-gray-500">Employee Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CheckInOut />
          </div>
          <div className="space-y-6">
            <PerformanceCard metrics={userMetrics} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userMetrics?.attendanceRate || 0}%
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tasks Done</p>
                <p className="text-2xl font-bold text-green-600">
                  {userMetrics?.tasksCompleted || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Hours</p>
                <p className="text-2xl font-bold text-purple-600">
                  {userMetrics?.averageHoursWorked || 0}h
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-gray-600">Streak</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {userMetrics?.streak || 0} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Today's Tasks ({todayTasks.length})
              </h3>
            </div>
            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                <>
                  {todayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-1">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-600">{task.description}</p>
                        </div>
                        {task.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>
                        {task.submittedAt && (
                          <span className="text-xs text-gray-500">
                            Submitted at {task.submittedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {todayTasks.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      And {todayTasks.length - 3} more tasks...
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No tasks added today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <TaskSubmission />
      </div>

      {/* Support Chatbot */}
      <SupportChatbot />
    </div>
  );
}
