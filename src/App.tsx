import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <DataProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </DataProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
