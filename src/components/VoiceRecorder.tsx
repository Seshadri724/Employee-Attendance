import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    isProcessing?: boolean;
    minDuration?: number;
    maxDuration?: number;
}

export default function VoiceRecorder({
    onRecordingComplete,
    isProcessing = false,
    minDuration = 3,
    maxDuration = 10,
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            audioChunksRef.current = [];

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            streamRef.current = stream;

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                    // Convert to WAV for backend compatibility
                    const wavBlob = await convertToWav(audioBlob);
                    onRecordingComplete(wavBlob);
                }
            };

            // Start recording
            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingTime(0);

            // Timer for recording duration
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= maxDuration) {
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);

        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    }, [maxDuration, onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
    }, []);

    const handleClick = () => {
        if (isRecording) {
            if (recordingTime < minDuration) {
                setError(`Please record for at least ${minDuration} seconds`);
                return;
            }
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Recording Button */}
            <button
                onClick={handleClick}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isProcessing
                        ? 'bg-gray-200 cursor-not-allowed'
                        : isRecording
                            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
                    }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-8 h-8 text-white" />
                ) : (
                    <Mic className="w-8 h-8 text-white" />
                )}
            </button>

            {/* Recording Status */}
            <div className="text-center">
                {isRecording ? (
                    <>
                        <p className="text-red-500 font-medium animate-pulse">
                            Recording... {recordingTime}s
                        </p>
                        <p className="text-xs text-gray-500">
                            {recordingTime < minDuration
                                ? `Record at least ${minDuration - recordingTime}s more`
                                : 'Click to stop'}
                        </p>
                    </>
                ) : isProcessing ? (
                    <p className="text-gray-500">Processing voice...</p>
                ) : (
                    <p className="text-gray-500 text-sm">
                        Click to start recording ({minDuration}-{maxDuration}s)
                    </p>
                )}
            </div>

            {/* Visual Feedback */}
            {isRecording && (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}
        </div>
    );
}

/**
 * Convert audio blob to WAV format
 * This is a simplified conversion - for production, use a proper audio library
 */
async function convertToWav(audioBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Get audio data
                const channelData = audioBuffer.getChannelData(0);
                const sampleRate = 16000;

                // Create WAV file
                const wavBuffer = encodeWav(channelData, sampleRate);
                const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

                resolve(wavBlob);
            } catch (err) {
                console.error('Error converting to WAV:', err);
                // Fallback to original blob if conversion fails
                resolve(audioBlob);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(audioBlob);
    });
}

/**
 * Encode audio data to WAV format
 */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
