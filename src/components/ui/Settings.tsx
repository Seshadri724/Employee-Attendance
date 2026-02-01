import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Download, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Modal from './Modal';
import DynamicForm, { FormField } from '../forms/DynamicForm';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { user, updateProfile } = useAuth();
  const { resetToDemo, refreshData } = useData();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'profile' | 'data' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);

  const profileFields: FormField[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      validation: (value) => {
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      }
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      disabled: true,
      description: 'Email cannot be changed for security reasons'
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Management', label: 'Management' }
      ]
    }
  ];

  const handleProfileUpdate = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      updateProfile({
        name: formData.name,
        department: formData.department,
      });

      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataReset = () => {
    if (window.confirm('Are you sure you want to reset all data to demo state? This cannot be undone.')) {
      resetToDemo();
      addNotification({
        type: 'info',
        title: 'Data Reset Complete',
        message: 'All data has been reset to demo state',
      });
    }
  };

  const handleDataRefresh = () => {
    refreshData();
    addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'All performance metrics have been recalculated',
    });
  };

  const handleExportData = () => {
    try {
      const data = {
        users: JSON.parse(localStorage.getItem('carivix_users') || '[]'),
        attendance: JSON.parse(localStorage.getItem('carivix_attendance') || '[]'),
        tasks: JSON.parse(localStorage.getItem('carivix_tasks') || '[]'),
        performance: JSON.parse(localStorage.getItem('carivix_performance') || '[]'),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carivix-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                activeTab === tab.id
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

      {activeTab === 'profile' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <DynamicForm
            fields={profileFields}
            onSubmit={handleProfileUpdate}
            submitLabel="Update Profile"
            loading={loading}
            initialValues={{
              name: user.name,
              email: user.email,
              department: user.department,
            }}
          />
        </div>
      )}

      {activeTab === 'data' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Refresh Data</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Recalculate all performance metrics and update statistics
              </p>
              <button
                onClick={handleDataRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Refresh Now
              </button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Export Data</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Download all your data as a JSON file for backup purposes
              </p>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Export Data
              </button>
            </div>

            {user.role === 'admin' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-gray-900">Reset to Demo</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Reset all data back to the original demo state. This action cannot be undone.
                </p>
                <button
                  onClick={handleDataReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Reset Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Notification Settings</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Customize how you receive notifications in the application
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">Check-in/Check-out confirmations</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">Task submission confirmations</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">Performance updates</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Daily reminders</span>
                </label>
              </div>
              
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}