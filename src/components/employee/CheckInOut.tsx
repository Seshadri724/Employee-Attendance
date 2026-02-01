import { useState, useEffect } from 'react';
import { Clock, Mic, MicOff, LogIn as CheckInIcon, LogOut as CheckOutIcon } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface CheckInOutProps {
  todayAttendance?: AttendanceRecord;
}

export default function CheckInOut({ todayAttendance }: CheckInOutProps) {
  const { user } = useAuth();
  const { checkIn, checkOut, attendance } = useData();
  const { addNotification } = useNotification();
  
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  // Get current attendance record
  const today = new Date().toISOString().split('T')[0];
  const currentAttendance = attendance.find(
    record => record.employeeId === user?.id && record.date === today
  );

  const isCheckedIn = !!currentAttendance?.checkIn;
  const isCheckedOut = !!currentAttendance?.checkOut;

  const handleCheckIn = () => {
    if (!user) return;
    
    checkIn(user.id);
    addNotification({
      type: 'success',
      title: 'Checked In Successfully',
      message: `Welcome to work! Check-in time: ${new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`,
    });
  };

  const handleCheckOut = () => {
    if (!user) return;
    
    checkOut(user.id);
    addNotification({
      type: 'success',
      title: 'Checked Out Successfully',
      message: `Have a great day! Check-out time: ${new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`,
    });
  };

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setVoiceCommand('Listening for voice command...');
      
      // Simulate voice recognition
      setTimeout(() => {
        const commands = ['check in', 'check out'];
        const command = commands[Math.floor(Math.random() * commands.length)];
        setVoiceCommand(`Voice detected: "${command}"`);
        
        if (command === 'check in' && !isCheckedIn) {
          setTimeout(() => {
            handleCheckIn();
            setVoiceCommand('Voice check-in completed!');
          }, 500);
        } else if (command === 'check out' && isCheckedIn && !isCheckedOut) {
          setTimeout(() => {
            handleCheckOut();
            setVoiceCommand('Voice check-out completed!');
          }, 500);
        } else {
          setVoiceCommand('Command not applicable at this time');
        }
        
        setTimeout(() => {
          setIsListening(false);
          setVoiceCommand('');
        }, 2000);
      }, 2000);
    } else {
      setVoiceCommand('');
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
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={`w-full py-2 rounded-lg font-medium transition ${
              isCheckedIn
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
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut}
            className={`w-full py-2 rounded-lg font-medium transition ${
              !isCheckedIn || isCheckedOut
                ? 'bg-green-200 text-green-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30'
            }`}
          >
            {isCheckedOut ? 'Checked Out' : 'Check Out Now'}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isListening ? (
              <MicOff className="w-5 h-5 text-purple-600 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5 text-purple-600" />
            )}
            <span className="font-medium text-purple-900">Voice Command</span>
          </div>
          <button
            onClick={handleVoiceCommand}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
        {voiceCommand && (
          <div className="mt-2 p-2 bg-white rounded-lg">
            <p className="text-sm text-gray-700 text-center">{voiceCommand}</p>
          </div>
        )}
        <p className="text-xs text-purple-700 mt-2 text-center">
          Say "check in" or "check out" to mark attendance
        </p>
      </div>
    </div>
  );
}
