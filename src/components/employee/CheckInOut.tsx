import { useState, useCallback } from 'react';
import { Clock, Mic, LogIn as CheckInIcon, LogOut as CheckOutIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { recordAttendance } from '../../api/attendance';
import { isSupabaseEnabled } from '../../lib/supabase';
import { identifySpeaker, checkVoiceServiceHealth } from '../../api/voiceApi';
import VoiceRecorder from '../VoiceRecorder';

export default function CheckInOut() {
  const { user } = useAuth();
  const { checkIn, checkOut, attendance, users } = useData();
  const { addNotification } = useNotification();

  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [voiceServiceAvailable, setVoiceServiceAvailable] = useState<boolean | null>(null);

  // Check voice service availability on first interaction
  const checkVoiceService = useCallback(async () => {
    if (voiceServiceAvailable === null) {
      const available = await checkVoiceServiceHealth();
      setVoiceServiceAvailable(available);
      return available;
    }
    return voiceServiceAvailable;
  }, [voiceServiceAvailable]);

  // Get current attendance record
  const today = new Date().toISOString().split('T')[0];
  const currentAttendance = attendance.find(
    record => record.employeeId === user?.id && record.date === today
  );

  const isCheckedIn = !!currentAttendance?.checkIn;
  const isCheckedOut = !!currentAttendance?.checkOut;

  // Get employee name from ID
  const getEmployeeName = (employeeId: string) => {
    const employee = users.find(u => u.id === employeeId);
    return employee?.name || employeeId;
  };

  const handleCheckIn = async (employeeId?: string) => {
    const targetId = employeeId || user?.id;
    if (!targetId) return;

    // Local state update
    checkIn(targetId);

    // Cloud sync with error notification
    if (isSupabaseEnabled) {
      try {
        const employee = users.find(u => u.id === targetId);
        await recordAttendance(targetId, employee?.name || targetId, 'check_in');
      } catch (err) {
        console.warn('Cloud sync failed for check-in:', err);
        addNotification({
          type: 'warning',
          title: 'Cloud Sync Failed',
          message: 'Check-in saved locally but could not sync to cloud.',
        });
      }
    }

    addNotification({
      type: 'success',
      title: 'Checked In Successfully',
      message: `Welcome to work, ${getEmployeeName(targetId)}! Check-in time: ${new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`,
    });
  };

  const handleCheckOut = async (employeeId?: string) => {
    const targetId = employeeId || user?.id;
    if (!targetId) return;

    // Local state update
    checkOut(targetId);

    // Cloud sync with error notification
    if (isSupabaseEnabled) {
      try {
        const employee = users.find(u => u.id === targetId);
        await recordAttendance(targetId, employee?.name || targetId, 'check_out');
      } catch (err) {
        console.warn('Cloud sync failed for check-out:', err);
        addNotification({
          type: 'warning',
          title: 'Cloud Sync Failed',
          message: 'Check-out saved locally but could not sync to cloud.',
        });
      }
    }

    addNotification({
      type: 'success',
      title: 'Checked Out Successfully',
      message: `Have a great day, ${getEmployeeName(targetId)}! Check-out time: ${new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`,
    });
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    setVoiceResult({ type: 'info', message: 'Analyzing voice...' });

    try {
      // Check voice service first
      const available = await checkVoiceService();
      if (!available) {
        setVoiceResult({
          type: 'error',
          message: 'Voice service not available. Start the backend server.',
        });
        setIsProcessingVoice(false);
        return;
      }

      // Identify speaker
      const result = await identifySpeaker(audioBlob);

      if (result.success && result.identified && result.employee_id) {
        const employeeName = getEmployeeName(result.employee_id);

        // Check attendance status for identified employee
        const employeeAttendance = attendance.find(
          record => record.employeeId === result.employee_id && record.date === today
        );
        const employeeCheckedIn = !!employeeAttendance?.checkIn;
        const employeeCheckedOut = !!employeeAttendance?.checkOut;

        if (!employeeCheckedIn) {
          // Check in
          await handleCheckIn(result.employee_id);
          setVoiceResult({
            type: 'success',
            message: `✅ ${employeeName} checked in (${result.confidence}% confidence)`,
          });
        } else if (!employeeCheckedOut) {
          // Check out
          await handleCheckOut(result.employee_id);
          setVoiceResult({
            type: 'success',
            message: `✅ ${employeeName} checked out (${result.confidence}% confidence)`,
          });
        } else {
          setVoiceResult({
            type: 'info',
            message: `${employeeName} already completed attendance today.`,
          });
        }
      } else {
        setVoiceResult({
          type: 'error',
          message: result.message || 'Voice not recognized. Please try again.',
        });
      }
    } catch (error) {
      console.error('Voice attendance error:', error);
      setVoiceResult({
        type: 'error',
        message: 'Failed to process voice. Check connection to backend.',
      });
    } finally {
      setIsProcessingVoice(false);

      // Clear result after 5 seconds
      setTimeout(() => setVoiceResult(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
          <p className="text-sm text-gray-600">Mark your check-in and check-out</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-900">Check In</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentAttendance?.checkIn || '--:--'}
              </p>
            </div>
            <CheckInIcon className="w-8 h-8 text-blue-600" />
          </div>
          <button
            onClick={() => handleCheckIn()}
            disabled={isCheckedIn}
            className={`w-full py-2 rounded-lg font-medium transition ${isCheckedIn
              ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
              }`}
          >
            {isCheckedIn ? 'Checked In' : 'Check In Now'}
          </button>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-green-900">Check Out</p>
              <p className="text-2xl font-bold text-green-600">
                {currentAttendance?.checkOut || '--:--'}
              </p>
            </div>
            <CheckOutIcon className="w-8 h-8 text-green-600" />
          </div>
          <button
            onClick={() => handleCheckOut()}
            disabled={!isCheckedIn || isCheckedOut}
            className={`w-full py-2 rounded-lg font-medium transition ${!isCheckedIn || isCheckedOut
              ? 'bg-green-200 text-green-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30'
              }`}
          >
            {isCheckedOut ? 'Checked Out' : 'Check Out Now'}
          </button>
        </div>
      </div>

      {/* Voice Biometric Attendance */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-900">Voice Biometric Attendance</span>
          {voiceServiceAvailable === false && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              Service Offline
            </span>
          )}
        </div>

        <div className="flex justify-center">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            isProcessing={isProcessingVoice}
            minDuration={3}
            maxDuration={6}
          />
        </div>

        {/* Voice Result Feedback */}
        {voiceResult && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${voiceResult.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : voiceResult.type === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
          >
            {voiceResult.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : voiceResult.type === 'error' ? (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            )}
            <span className="text-sm">{voiceResult.message}</span>
          </div>
        )}

        <p className="text-xs text-purple-700 mt-3 text-center">
          <strong>Tip:</strong> Speak clearly for 3-4 seconds. Say your name or a phrase like "Marking my attendance."
        </p>
      </div>
    </div>
  );
}
