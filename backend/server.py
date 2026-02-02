"""
CARIVIX Backend API Server
Flask server providing chatbot and voice attendance endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"])

# Import services
from chatbot_service import get_chatbot_response

# Voice service is lazy-loaded due to heavy dependencies
voice_service_available = False
try:
    from voice_service import (
        register_voice,
        identify_speaker,
        get_registered_voices,
        delete_voice
    )
    voice_service_available = True
except ImportError as e:
    print(f"[WARNING] Voice service not available: {e}")
    print("   Install PyTorch and SpeechBrain to enable voice attendance")


# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "CARIVIX Backend API",
        "chatbot": True,
        "voice_attendance": voice_service_available
    })


# ==================== Chatbot Endpoints ====================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chatbot endpoint for customer support queries.
    
    Request body:
        {"message": "user's question"}
    
    Response:
        {"response": "bot's answer", "success": true}
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'message' field in request body"
            }), 400
        
        user_message = data['message']
        response = get_chatbot_response(user_message)
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================== Voice Attendance Endpoints ====================

@app.route('/api/voice/register', methods=['POST'])
def voice_register():
    """
    Register an employee's voice for attendance.
    
    Request:
        - Form data with 'employee_id' field
        - Audio file as 'audio' field (WAV format)
    
    Response:
        {"success": true/false, "message": "..."}
    """
    if not voice_service_available:
        return jsonify({
            "success": False,
            "error": "Voice service not available. Install PyTorch and SpeechBrain."
        }), 503
    
    try:
        # Get employee ID
        employee_id = request.form.get('employee_id')
        if not employee_id:
            return jsonify({
                "success": False,
                "error": "Missing 'employee_id' field"
            }), 400
        
        # Get audio file
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "Missing 'audio' file"
            }), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        
        if len(audio_bytes) < 1000:
            return jsonify({
                "success": False,
                "error": "Audio file too small. Please record at least 3-4 seconds."
            }), 400
        
        # Register voice
        result = register_voice(employee_id, audio_bytes)
        
        return jsonify(result), 200 if result["success"] else 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/voice/identify', methods=['POST'])
def voice_identify():
    """
    Identify a speaker from voice recording for attendance.
    
    Request:
        - Audio file as 'audio' field (WAV format)
    
    Response:
        {
            "success": true/false,
            "identified": true/false,
            "employee_id": "...",
            "confidence": 85.5,
            "message": "..."
        }
    """
    if not voice_service_available:
        return jsonify({
            "success": False,
            "error": "Voice service not available. Install PyTorch and SpeechBrain."
        }), 503
    
    try:
        # Get audio file
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "Missing 'audio' file"
            }), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        
        if len(audio_bytes) < 1000:
            return jsonify({
                "success": False,
                "error": "Audio file too small. Please record at least 3-4 seconds."
            }), 400
        
        # Identify speaker
        result = identify_speaker(audio_bytes)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/voice/registered', methods=['GET'])
def voice_list():
    """Get list of registered voice profiles."""
    if not voice_service_available:
        return jsonify({
            "success": False,
            "error": "Voice service not available"
        }), 503
    
    result = get_registered_voices()
    return jsonify(result)


@app.route('/api/voice/delete/<employee_id>', methods=['DELETE'])
def voice_delete(employee_id):
    """Delete a registered voice profile."""
    if not voice_service_available:
        return jsonify({
            "success": False,
            "error": "Voice service not available"
        }), 503
    
    result = delete_voice(employee_id)
    return jsonify(result), 200 if result["success"] else 404


# ==================== Main ====================

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("[SERVER] CARIVIX Backend API Server")
    print("=" * 50)
    print(f"[OK] Chatbot Service: Enabled")
    print(f"[{'OK' if voice_service_available else 'OFF'}] Voice Service: {'Enabled' if voice_service_available else 'Disabled (install PyTorch)'}")
    print("=" * 50)
    print("\nEndpoints:")
    print("  POST /api/chat           - Chatbot queries")
    print("  POST /api/voice/register - Register voice")
    print("  POST /api/voice/identify - Identify speaker")
    print("  GET  /api/voice/registered - List registered voices")
    print("  GET  /api/health         - Health check")
    print("\n" + "=" * 50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
