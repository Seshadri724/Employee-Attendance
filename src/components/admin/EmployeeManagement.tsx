import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../ui/Modal';
import DynamicForm, { FormField } from '../forms/DynamicForm';
import { User } from '../../types';

export default function EmployeeManagement() {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { addNotification } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const employees = users.filter(user => user.role === 'employee');
  const departments = [...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter employee name',
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
      placeholder: 'Enter email address',
      required: true,
      validation: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      }
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
        { value: 'Operations', label: 'Operations' }
      ]
    }
  ];

  const handleAddEmployee = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      // Check if email already exists
      const existingUser = users.find(user => user.email === formData.email);
      if (existingUser) {
        addNotification({
          type: 'error',
          title: 'Email Already Exists',
          message: 'An employee with this email already exists',
        });
        return;
      }

      addUser({
        name: formData.name,
        email: formData.email,
        role: 'employee',
        department: formData.department,
      });

      addNotification({
        type: 'success',
        title: 'Employee Added',
        message: `${formData.name} has been added successfully`,
      });

      setShowAddModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Add Employee',
        message: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (formData: Record<string, any>) => {
    if (!editingUser) return;
    
    setLoading(true);
    try {
      // Check if email already exists (excluding current user)
      const existingUser = users.find(user => 
        user.email === formData.email && user.id !== editingUser.id
      );
      if (existingUser) {
        addNotification({
          type: 'error',
          title: 'Email Already Exists',
          message: 'Another employee with this email already exists',
        });
        return;
      }

      updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
      });

      addNotification({
        type: 'success',
        title: 'Employee Updated',
        message: `${formData.name}'s information has been updated`,
      });

      setEditingUser(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Employee',
        message: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = (employee: User) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This will also remove all their attendance records and tasks.`)) {
      deleteUser(employee.id);
      addNotification({
        type: 'success',
        title: 'Employee Deleted',
        message: `${employee.name} has been removed from the system`,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
          <p className="text-sm text-gray-600">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <p className="text-xs text-gray-500">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingUser(employee)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              {searchTerm || departmentFilter ? 'No employees match your filters' : 'No employees found'}
            </p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        size="md"
      >
        <DynamicForm
          fields={formFields}
          onSubmit={handleAddEmployee}
          submitLabel="Add Employee"
          loading={loading}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Employee"
        size="md"
      >
        {editingUser && (
          <DynamicForm
            fields={formFields}
            onSubmit={handleEditEmployee}
            submitLabel="Update Employee"
            loading={loading}
            initialValues={{
              name: editingUser.name,
              email: editingUser.email,
              department: editingUser.department,
            }}
          />
        )}
      </Modal>
    </div>
  );
}