export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  checkInTimestamp?: string;  // ISO timestamp for accurate calculation
  checkOutTimestamp?: string; // ISO timestamp for accurate calculation
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked?: number;
}

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
  submittedAt?: string;
}

export interface PerformanceMetrics {
  employeeId: string;
  attendanceRate: number;
  tasksCompleted: number;
  averageHoursWorked: number;
  performanceScore: number;
  streak: number;
}
