import { useState } from 'react';
import {
  LogOut,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import EmployeeTable from './admin/EmployeeTable';
import PerformanceChart from './admin/PerformanceChart';
import EmployeeManagement from './admin/EmployeeManagement';
import ReportsView from './admin/ReportsView';
import VoiceRegistration from './admin/VoiceRegistration';
import SupportChatbot from './SupportChatbot';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { users, attendance, allTasks, performance, refreshData, resetToDemo } = useData();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'reports' | 'voice'>('overview');

  const employees = users.filter((u) => u.role === 'employee');

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayDate);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length;

  const avgPerformance = performance.length > 0
    ? performance.reduce((sum, m) => sum + m.performanceScore, 0) / performance.length
    : 0;

  const avgAttendance = performance.length > 0
    ? performance.reduce((sum, m) => sum + m.attendanceRate, 0) / performance.length
    : 0;

  const handleRefreshData = () => {
    refreshData();
    addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'All performance metrics have been recalculated',
    });
  };

  const handleResetDemo = () => {
    if (window.confirm('Are you sure you want to reset all data to demo state? This cannot be undone.')) {
      resetToDemo();
      addNotification({
        type: 'info',
        title: 'Data Reset',
        message: 'All data has been reset to demo state',
      });
    }
  };

  const tabs: { id: 'overview' | 'employees' | 'reports' | 'voice'; label: string; icon: typeof TrendingUp }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'reports', label: 'Reports', icon: Award },
    { id: 'voice', label: 'Voice Setup', icon: Settings },
  ];

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
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefreshData}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Reset to Demo"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{employees.length}</p>
                <p className="text-sm text-gray-600">Employees</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Today</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {presentCount + lateCount}/{employees.length}
                </p>
                <p className="text-sm text-gray-600">Present</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Rate</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {avgAttendance.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Avg Attendance</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Score</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {avgPerformance.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <EmployeeTable employees={employees} />
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                        <span className="text-sm font-bold text-blue-600">
                          {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total Tasks</p>
                        <p className="text-xl font-bold text-blue-600">{totalTasks}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Completed</p>
                        <p className="text-xl font-bold text-green-600">{completedTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Today's Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">On Time</span>
                      <span className="text-sm font-bold text-green-600">{presentCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Late</span>
                      <span className="text-sm font-bold text-yellow-600">{lateCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Absent</span>
                      <span className="text-sm font-bold text-red-600">
                        {employees.length - presentCount - lateCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <PerformanceChart />
          </>
        )}

        {activeTab === 'employees' && <EmployeeManagement />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'voice' && <VoiceRegistration />}
      </div>

      {/* Support Chatbot */}
      <SupportChatbot />
    </div>
  );
}
