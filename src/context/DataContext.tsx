import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, AttendanceRecord, Task, PerformanceMetrics } from '../types';
import { demoUsers, attendanceRecords, tasks, performanceMetrics } from '../data/demoData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isLateCheckIn, isWeekend } from '../config/appConfig';

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;

  // Tasks
  allTasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  submitTask: (id: string) => void;

  // Performance
  performance: PerformanceMetrics[];
  updatePerformance: (employeeId: string, metrics: Partial<PerformanceMetrics>) => void;
  calculatePerformance: (employeeId: string) => void;

  // Utility
  refreshData: () => void;
  resetToDemo: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('carivix_users', demoUsers);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('carivix_attendance', attendanceRecords);
  const [allTasks, setAllTasks] = useLocalStorage<Task[]>('carivix_tasks', tasks);
  const [performance, setPerformance] = useLocalStorage<PerformanceMetrics[]>('carivix_performance', performanceMetrics);

  // Generate unique ID
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // User management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Clean up related data
    setAttendance(prev => prev.filter(record => record.employeeId !== id));
    setAllTasks(prev => prev.filter(task => task.employeeId !== id));
    setPerformance(prev => prev.filter(perf => perf.employeeId !== id));
  };

  // Attendance management
  const addAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: generateId(),
    };
    setAttendance(prev => [...prev, newRecord]);
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(record =>
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  const checkIn = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Check if already checked in today
    const existingRecord = attendance.find(
      record => record.employeeId === employeeId && record.date === today
    );

    if (existingRecord && !existingRecord.checkOut) {
      return; // Already checked in
    }

    // Use configurable late check-in logic
    const isLate = isLateCheckIn(now);

    const newRecord: AttendanceRecord = {
      id: generateId(),
      employeeId,
      date: today,
      checkIn: timeString,
      checkInTimestamp: now.toISOString(), // Store ISO for accurate calculation
      status: isLate ? 'late' : 'present',
    };

    setAttendance(prev => [...prev, newRecord]);
  };

  const checkOut = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    setAttendance(prev => prev.map(record => {
      if (record.employeeId === employeeId && record.date === today && !record.checkOut) {
        // Use stored timestamp if available, otherwise fall back to parsing
        let checkInTime: Date;
        if (record.checkInTimestamp) {
          checkInTime = new Date(record.checkInTimestamp);
        } else {
          // Fallback for old records without timestamp
          checkInTime = new Date(`${today} ${record.checkIn}`);
        }
        const checkOutTime = now;
        const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        return {
          ...record,
          checkOut: timeString,
          checkOutTimestamp: now.toISOString(),
          hoursWorked: Math.round(hoursWorked * 100) / 100,
        };
      }
      return record;
    }));
  };

  // Task management
  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
    };
    setAllTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setAllTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setAllTasks(prev => prev.filter(task => task.id !== id));
  };

  const submitTask = (id: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    updateTask(id, {
      status: 'completed',
      submittedAt: timeString,
    });
  };

  // Performance calculation
  const calculatePerformance = (employeeId: string) => {
    const userAttendance = attendance.filter(record => record.employeeId === employeeId);
    const userTasks = allTasks.filter(task => task.employeeId === employeeId);

    const totalDays = userAttendance.length;
    const presentDays = userAttendance.filter(record =>
      record.status === 'present' || record.status === 'late'
    ).length;

    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    const tasksCompleted = userTasks.filter(task => task.status === 'completed').length;

    const totalHours = userAttendance.reduce((sum, record) =>
      sum + (record.hoursWorked || 0), 0
    );
    const averageHoursWorked = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0;

    // Calculate streak (consecutive working days, skipping weekends)
    const sortedAttendance = userAttendance
      .filter(record => record.status === 'present' || record.status === 'late')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let checkDate = new Date();

    // Start from yesterday if today hasn't been checked in yet
    if (!sortedAttendance.some(r => r.date === checkDate.toISOString().split('T')[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const record of sortedAttendance) {
      // Skip weekends when counting streak
      while (isWeekend(checkDate)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      const expectedDate = checkDate.toISOString().split('T')[0];
      if (record.date === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const performanceScore = Math.round(
      (attendanceRate * 0.4) +
      (Math.min(tasksCompleted * 2, 40) * 0.3) +
      (Math.min(averageHoursWorked * 5, 30) * 0.3)
    );

    const newMetrics: PerformanceMetrics = {
      employeeId,
      attendanceRate,
      tasksCompleted,
      averageHoursWorked,
      performanceScore,
      streak,
    };

    setPerformance(prev => {
      const existing = prev.find(p => p.employeeId === employeeId);
      if (existing) {
        return prev.map(p => p.employeeId === employeeId ? newMetrics : p);
      }
      return [...prev, newMetrics];
    });
  };

  const updatePerformance = (employeeId: string, metrics: Partial<PerformanceMetrics>) => {
    setPerformance(prev => prev.map(perf =>
      perf.employeeId === employeeId ? { ...perf, ...metrics } : perf
    ));
  };

  // Utility functions
  const refreshData = () => {
    // Recalculate performance for all employees
    const employees = users.filter(user => user.role === 'employee');
    employees.forEach(employee => calculatePerformance(employee.id));
  };

  const resetToDemo = () => {
    setUsers(demoUsers);
    setAttendance(attendanceRecords);
    setAllTasks(tasks);
    setPerformance(performanceMetrics);
  };

  // Auto-calculate performance when data changes
  useEffect(() => {
    const employees = users.filter(user => user.role === 'employee');
    employees.forEach(employee => {
      const hasMetrics = performance.some(p => p.employeeId === employee.id);
      if (!hasMetrics) {
        calculatePerformance(employee.id);
      }
    });
  }, [users, attendance, allTasks]);

  const value: DataContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
    attendance,
    addAttendance,
    updateAttendance,
    checkIn,
    checkOut,
    allTasks,
    addTask,
    updateTask,
    deleteTask,
    submitTask,
    performance,
    updatePerformance,
    calculatePerformance,
    refreshData,
    resetToDemo,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}