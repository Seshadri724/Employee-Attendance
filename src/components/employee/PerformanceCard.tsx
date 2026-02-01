import { Award, TrendingUp, Target, Calendar } from 'lucide-react';
import { PerformanceMetrics } from '../../types';

interface PerformanceCardProps {
  metrics?: PerformanceMetrics;
}

export default function PerformanceCard({ metrics }: PerformanceCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getMotivationalMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance! You're setting the standard.";
    if (score >= 75) return "Great work! Keep up the excellent performance.";
    if (score >= 60) return "Good progress! A few improvements will boost your score.";
    return "Let's work together to improve your performance metrics.";
  };

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <p className="text-sm text-gray-600">Building your profile...</p>
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm font-medium mb-2">Performance Tracking</p>
          <p className="text-xs">Your metrics will appear as you use the system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Award className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          <p className="text-sm text-gray-600">Your overall score</p>
        </div>
      </div>

      <div className="relative mb-6">
        <div
          className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getScoreBgColor(
            metrics.performanceScore
          )} flex items-center justify-center shadow-xl`}
        >
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
            <div className="text-center">
              <p className={`text-3xl font-bold ${getScoreColor(metrics.performanceScore)}`}>
                {metrics.performanceScore}
              </p>
              <p className="text-xs text-gray-600">Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Attendance</span>
          </div>
          <span className="text-sm font-bold text-blue-600">
            {metrics.attendanceRate}%
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
          </div>
          <span className="text-sm font-bold text-green-600">
            {metrics.tasksCompleted}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Avg Hours/Day</span>
          <span className="text-sm font-bold text-purple-600">
            {metrics.averageHoursWorked}h
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Current Streak</span>
          <span className="text-sm font-bold text-orange-600">
            {metrics.streak} days
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Performance Insight</span>
        </div>
        <p className="text-xs text-gray-700">
          {getMotivationalMessage(metrics.performanceScore)}
        </p>
      </div>
    </div>
  );
}
