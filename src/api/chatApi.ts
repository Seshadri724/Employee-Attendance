/**
 * Chat API Helper
 * Handles communication with the chatbot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChatResponse {
    success: boolean;
    response?: string;
    error?: string;
}

/**
 * Send a message to the chatbot and get a response
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Chat API error:', error);
        return {
            success: false,
            error: 'Unable to connect to chatbot service. Please try again later.',
        };
    }
}

/**
 * Check if the backend is available
 */
export async function checkChatbotHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        return data.status === 'healthy' && data.chatbot === true;
    } catch {
        return false;
    }
}
