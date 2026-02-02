import { useState, useEffect } from 'react';
import { Mic, UserCheck, Users, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import VoiceRecorder from '../VoiceRecorder';
import { registerVoice, getRegisteredVoices, deleteVoice } from '../../api/voiceApi';

export default function VoiceRegistration() {
    const { users } = useData();
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [registeredVoices, setRegisteredVoices] = useState<string[]>([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(true);

    // Get employees only (not admins)
    const employees = users.filter(u => u.role === 'employee');

    // Load registered voices on mount
    useEffect(() => {
        loadRegisteredVoices();
    }, []);

    const loadRegisteredVoices = async () => {
        setIsLoadingVoices(true);
        const result = await getRegisteredVoices();
        if (result.success && result.employees) {
            setRegisteredVoices(result.employees);
        }
        setIsLoadingVoices(false);
    };

    const handleRecordingComplete = async (audioBlob: Blob) => {
        if (!selectedEmployee) {
            setMessage({ type: 'error', text: 'Please select an employee first' });
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            const result = await registerVoice(selectedEmployee, audioBlob);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Voice registered successfully!'
                });
                await loadRegisteredVoices();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || result.message || 'Failed to register voice'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Connection error. Make sure the backend server is running.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteVoice = async (employeeId: string) => {
        if (!confirm(`Delete voice profile for ${employeeId}?`)) return;

        const result = await deleteVoice(employeeId);
        if (result.success) {
            setMessage({ type: 'success', text: `Voice deleted for ${employeeId}` });
            await loadRegisteredVoices();
        } else {
            setMessage({ type: 'error', text: result.message || 'Failed to delete voice' });
        }
    };

    // Find employee name by ID
    const getEmployeeName = (id: string) => {
        const employee = employees.find(e => e.id === id);
        return employee?.name || id;
    };

    // Check if selected employee has voice registered
    const isVoiceRegistered = (employeeId: string) => {
        return registeredVoices.includes(employeeId);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Voice Registration</h3>
                    <p className="text-sm text-gray-600">Register employee voices for attendance</p>
                </div>
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee
                </label>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                        value={selectedEmployee}
                        onChange={(e) => {
                            setSelectedEmployee(e.target.value);
                            setMessage(null);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">-- Select an employee --</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.name} ({employee.department})
                                {isVoiceRegistered(employee.id) ? ' ✓' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedEmployee && isVoiceRegistered(selectedEmployee) && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Voice already registered. Recording will update the profile.
                    </p>
                )}
            </div>

            {/* Voice Recording */}
            {selectedEmployee && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">
                        Record 4 seconds of speech
                    </h4>
                    <p className="text-xs text-gray-500 text-center mb-4">
                        Ask employee to say: "Good morning, this is {getEmployeeName(selectedEmployee)}, marking my attendance."
                    </p>
                    <VoiceRecorder
                        onRecordingComplete={handleRecordingComplete}
                        isProcessing={isProcessing}
                        minDuration={3}
                        maxDuration={8}
                    />
                </div>
            )}

            {/* Status Message */}
            {message && (
                <div
                    className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            {/* Registered Voices List */}
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">
                        Registered Voices ({registeredVoices.length})
                    </h4>
                    <button
                        onClick={loadRegisteredVoices}
                        className="text-sm text-purple-600 hover:text-purple-700"
                    >
                        Refresh
                    </button>
                </div>

                {isLoadingVoices ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                ) : registeredVoices.length > 0 ? (
                    <div className="space-y-2">
                        {registeredVoices.map((employeeId) => (
                            <div
                                key={employeeId}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {getEmployeeName(employeeId)}
                                    </span>
                                    <span className="text-xs text-gray-500">({employeeId})</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteVoice(employeeId)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete voice profile"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No voices registered yet. Select an employee and record their voice.
                    </p>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">📝 Voice Recording Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Record in a quiet environment with minimal background noise</li>
                    <li>• Speak clearly and at a consistent pace</li>
                    <li>• The employee should speak for at least 3-4 seconds</li>
                    <li>• Avoid pauses or silence at the beginning/end</li>
                </ul>
            </div>
        </div>
    );
}
