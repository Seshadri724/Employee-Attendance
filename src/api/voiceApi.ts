/**
 * Voice API Helper
 * Handles communication with the voice attendance backend
 */

const API_BASE_URL = 'http://localhost:5000';

export interface VoiceIdentifyResponse {
    success: boolean;
    identified?: boolean;
    employee_id?: string;
    confidence?: number;
    message?: string;
    error?: string;
}

export interface VoiceRegisterResponse {
    success: boolean;
    message?: string;
    audio_duration?: number;
    error?: string;
}

export interface RegisteredVoicesResponse {
    success: boolean;
    count?: number;
    employees?: string[];
    error?: string;
}

/**
 * Register an employee's voice for attendance
 */
export async function registerVoice(
    employeeId: string,
    audioBlob: Blob
): Promise<VoiceRegisterResponse> {
    try {
        const formData = new FormData();
        formData.append('employee_id', employeeId);
        formData.append('audio', audioBlob, 'voice.wav');

        const response = await fetch(`${API_BASE_URL}/api/voice/register`, {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error('Voice register API error:', error);
        return {
            success: false,
            error: 'Unable to connect to voice service. Please try again later.',
        };
    }
}

/**
 * Identify a speaker from their voice recording
 */
export async function identifySpeaker(
    audioBlob: Blob
): Promise<VoiceIdentifyResponse> {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.wav');

        const response = await fetch(`${API_BASE_URL}/api/voice/identify`, {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error('Voice identify API error:', error);
        return {
            success: false,
            identified: false,
            error: 'Unable to connect to voice service. Please try again later.',
        };
    }
}

/**
 * Get list of registered voice profiles
 */
export async function getRegisteredVoices(): Promise<RegisteredVoicesResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/voice/registered`);
        return await response.json();
    } catch (error) {
        console.error('Voice list API error:', error);
        return {
            success: false,
            error: 'Unable to connect to voice service.',
        };
    }
}

/**
 * Delete a registered voice profile
 */
export async function deleteVoice(employeeId: string): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/voice/delete/${employeeId}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error('Voice delete API error:', error);
        return {
            success: false,
            message: 'Unable to connect to voice service.',
        };
    }
}

/**
 * Check if the voice service is available
 */
export async function checkVoiceServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        return data.status === 'healthy' && data.voice_attendance === true;
    } catch {
        return false;
    }
}
