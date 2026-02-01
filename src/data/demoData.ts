import { User, AttendanceRecord, Task, PerformanceMetrics } from '../types';

export const demoUsers: User[] = [
  {
    id: 'emp1',
    name: 'John Smith',
    email: 'john@carivix.com',
    role: 'employee',
    department: 'Engineering',
  },
  {
    id: 'emp2',
    name: 'Sarah Johnson',
    email: 'sarah@carivix.com',
    role: 'employee',
    department: 'Marketing',
  },
  {
    id: 'emp3',
    name: 'Mike Wilson',
    email: 'mike@carivix.com',
    role: 'employee',
    department: 'Sales',
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@carivix.com',
    role: 'admin',
    department: 'Management',
  },
];

export const demoCredentials = {
  employee: { email: 'john@carivix.com', password: 'employee123' },
  admin: { email: 'admin@carivix.com', password: 'admin123' },
};

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'att1',
    employeeId: 'emp1',
    date: '2026-02-01',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    status: 'present',
    hoursWorked: 9,
  },
  {
    id: 'att2',
    employeeId: 'emp1',
    date: '2026-01-31',
    checkIn: '09:15 AM',
    checkOut: '06:30 PM',
    status: 'late',
    hoursWorked: 9.25,
  },
  {
    id: 'att3',
    employeeId: 'emp2',
    date: '2026-02-01',
    checkIn: '08:45 AM',
    checkOut: '05:45 PM',
    status: 'present',
    hoursWorked: 9,
  },
  {
    id: 'att4',
    employeeId: 'emp3',
    date: '2026-02-01',
    checkIn: '09:30 AM',
    checkOut: '06:00 PM',
    status: 'late',
    hoursWorked: 8.5,
  },
];

export const tasks: Task[] = [
  {
    id: 'task1',
    employeeId: 'emp1',
    title: 'Complete API Integration',
    description: 'Integrate payment gateway API with the checkout system',
    status: 'completed',
    date: '2026-02-01',
    submittedAt: '05:30 PM',
  },
  {
    id: 'task2',
    employeeId: 'emp1',
    title: 'Code Review',
    description: 'Review pull requests for the new feature branch',
    status: 'in-progress',
    date: '2026-02-01',
  },
  {
    id: 'task3',
    employeeId: 'emp2',
    title: 'Social Media Campaign',
    description: 'Create content calendar for Q1 marketing campaign',
    status: 'completed',
    date: '2026-02-01',
    submittedAt: '04:00 PM',
  },
  {
    id: 'task4',
    employeeId: 'emp3',
    title: 'Client Meeting',
    description: 'Present product demo to potential client',
    status: 'completed',
    date: '2026-02-01',
    submittedAt: '03:30 PM',
  },
];

export const performanceMetrics: PerformanceMetrics[] = [
  {
    employeeId: 'emp1',
    attendanceRate: 96,
    tasksCompleted: 42,
    averageHoursWorked: 9.2,
    performanceScore: 94,
    streak: 15,
  },
  {
    employeeId: 'emp2',
    attendanceRate: 98,
    tasksCompleted: 38,
    averageHoursWorked: 9.0,
    performanceScore: 96,
    streak: 20,
  },
  {
    employeeId: 'emp3',
    attendanceRate: 92,
    tasksCompleted: 35,
    averageHoursWorked: 8.8,
    performanceScore: 89,
    streak: 10,
  },
];
