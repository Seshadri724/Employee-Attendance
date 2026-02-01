import { useState } from 'react';
import { Plus, Send, CheckCircle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import DynamicForm, { FormField } from '../forms/DynamicForm';

export default function TaskSubmission() {
  const { user } = useAuth();
  const { addTask, allTasks } = useData();
  const { addNotification } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const userTasks = allTasks.filter(task => task.employeeId === user?.id);
  const todayTasks = userTasks.filter(task => 
    task.date === new Date().toISOString().split('T')[0]
  );

  const formFields: FormField[] = [
    {
      name: 'title',
      label: 'Task Title',
      type: 'text',
      placeholder: 'Enter task title',
      required: true,
      validation: (value) => {
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        return null;
      }
    },
    {
      name: 'description',
      label: 'Task Description',
      type: 'textarea',
      placeholder: 'Describe what you accomplished',
      required: true,
      validation: (value) => {
        if (value.length < 10) return 'Description must be at least 10 characters';
        if (value.length > 500) return 'Description must be less than 500 characters';
        return null;
      }
    },
    {
      name: 'status',
      label: 'Task Status',
      type: 'select',
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
      ]
    }
  ];

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const taskData = {
        employeeId: user.id,
        title: formData.title,
        description: formData.description,
        status: formData.status as 'pending' | 'in-progress' | 'completed',
        date: new Date().toISOString().split('T')[0],
        ...(formData.status === 'completed' && {
          submittedAt: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })
      };

      addTask(taskData);
      
      addNotification({
        type: 'success',
        title: 'Task Added Successfully',
        message: `Task "${formData.title}" has been added to your list`,
      });

      setShowForm(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Add Task',
        message: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Task Management</h3>
            <p className="text-sm text-gray-600">
              Add and track your daily tasks ({todayTasks.length} tasks today)
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {showForm && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Add New Task</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <DynamicForm
            fields={formFields}
            onSubmit={handleSubmit}
            submitLabel="Add Task"
            loading={loading}
            initialValues={{ status: 'pending' }}
          />
        </div>
      )}

      {!showForm && todayTasks.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Today's Tasks</h4>
          <div className="space-y-3">
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
                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'completed'
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
                  {task.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                And {todayTasks.length - 3} more tasks...
              </p>
            )}
          </div>
        </div>
      )}

      {!showForm && todayTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-t border-gray-200">
          <p className="text-sm">No tasks added today. Click "Add Task" to get started!</p>
        </div>
      )}
    </div>
  );
}
