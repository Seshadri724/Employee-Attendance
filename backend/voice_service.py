"""
Voice Attendance Service for CARIVIX Attendance Management System
Uses SpeechBrain ECAPA-TDNN for speaker recognition
"""

import os

# Disable torchaudio backend check (fixes compatibility with newer torchaudio versions)
os.environ["TORCHAUDIO_USE_BACKEND_DISPATCHER"] = "0"
os.environ["SPEECHBRAIN_FETCH_CACHE"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pretrained_models")

import io
import numpy as np
import torch
import soundfile as sf
from scipy.spatial.distance import cosine
from typing import Optional, Tuple, Dict

# Monkey-patch torchaudio for SpeechBrain compatibility with newer versions
import torchaudio
if not hasattr(torchaudio, 'list_audio_backends'):
    torchaudio.list_audio_backends = lambda: ['soundfile']
if not hasattr(torchaudio, 'get_audio_backend'):
    torchaudio.get_audio_backend = lambda: 'soundfile'
if not hasattr(torchaudio, 'set_audio_backend'):
    torchaudio.set_audio_backend = lambda x: None

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICE_DB_PATH = os.path.join(BASE_DIR, "voice_db")
os.makedirs(VOICE_DB_PATH, exist_ok=True)

# Configuration
SIMILARITY_THRESHOLD = 0.35  # Lowered from 0.50 for better recognition
SAMPLE_RATE = 16000

# Global model instance (lazy loaded)
_model = None


def get_model():
    """Lazy-load the SpeechBrain speaker recognition model."""
    global _model
    if _model is None:
        try:
            from speechbrain.pretrained import SpeakerRecognition
            # Don't use custom savedir to avoid Windows symlink permission issues
            # Let HuggingFace manage the cache at ~/.cache/huggingface/
            _model = SpeakerRecognition.from_hparams(
                source="speechbrain/spkrec-ecapa-voxceleb",
                run_opts={"device": "cpu"}
            )
            print("[OK] Voice recognition model loaded successfully")
        except Exception as e:
            print(f"[ERROR] Failed to load voice model: {e}")
            raise
    return _model


def preprocess_audio(audio_bytes: bytes) -> torch.Tensor:
    """
    Convert audio bytes to a normalized tensor suitable for the model.
    
    Args:
        audio_bytes: Raw audio data in WAV format
        
    Returns:
        Preprocessed audio tensor
    """
    from scipy.signal import resample
    
    # Read audio from bytes
    audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))
    
    # Convert to mono if stereo
    if len(audio_data.shape) > 1:
        audio_data = np.mean(audio_data, axis=1)
    
    # Resample to 16kHz if needed using scipy (more compatible than torchaudio)
    if sample_rate != SAMPLE_RATE:
        # Calculate new number of samples
        num_samples = int(len(audio_data) * SAMPLE_RATE / sample_rate)
        audio_data = resample(audio_data, num_samples)
    
    # Normalize
    max_val = np.max(np.abs(audio_data))
    if max_val > 0:
        audio_data = audio_data / max_val
    
    # Convert to tensor
    audio_tensor = torch.tensor(audio_data, dtype=torch.float32).unsqueeze(0)
    
    return audio_tensor


def get_embedding(audio_tensor: torch.Tensor) -> np.ndarray:
    """
    Extract speaker embedding from audio tensor.
    
    Args:
        audio_tensor: Preprocessed audio tensor
        
    Returns:
        Speaker embedding as numpy array
    """
    model = get_model()
    with torch.no_grad():
        embedding = model.encode_batch(audio_tensor)
    return embedding.squeeze().numpy()


def register_voice(employee_id: str, audio_bytes: bytes) -> Dict:
    """
    Register an employee's voice by storing their embedding.
    
    Args:
        employee_id: Unique identifier for the employee
        audio_bytes: Audio recording in WAV format
        
    Returns:
        Dict with success status and message
    """
    try:
        # Preprocess audio
        audio_tensor = preprocess_audio(audio_bytes)
        
        # Check audio length (should be at least 2 seconds)
        audio_length = audio_tensor.shape[1] / SAMPLE_RATE
        if audio_length < 2.0:
            return {
                "success": False,
                "message": f"Audio too short ({audio_length:.1f}s). Please record at least 3-4 seconds."
            }
        
        # Extract embedding
        embedding = get_embedding(audio_tensor)
        
        # Save embedding
        embedding_path = os.path.join(VOICE_DB_PATH, f"{employee_id}.npy")
        np.save(embedding_path, embedding)
        
        return {
            "success": True,
            "message": f"Voice registered successfully for employee {employee_id}",
            "audio_duration": round(audio_length, 1)
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to register voice: {str(e)}"
        }


def identify_speaker(audio_bytes: bytes) -> Dict:
    """
    Identify a speaker from their voice recording.
    
    Args:
        audio_bytes: Audio recording in WAV format
        
    Returns:
        Dict with identification results
    """
    try:
        # Check if any voices are registered
        voice_files = [f for f in os.listdir(VOICE_DB_PATH) if f.endswith('.npy')]
        if not voice_files:
            return {
                "success": False,
                "identified": False,
                "message": "No voices registered in the system. Please register voices first."
            }
        
        # Preprocess audio
        audio_tensor = preprocess_audio(audio_bytes)
        
        # Check audio length
        audio_length = audio_tensor.shape[1] / SAMPLE_RATE
        if audio_length < 2.0:
            return {
                "success": False,
                "identified": False,
                "message": f"Audio too short ({audio_length:.1f}s). Please speak for at least 3-4 seconds."
            }
        
        # Extract embedding
        test_embedding = get_embedding(audio_tensor)
        
        # Compare with all registered voices
        best_score = 0
        best_employee = None
        all_scores = {}
        
        for voice_file in voice_files:
            employee_id = voice_file.replace(".npy", "")
            stored_embedding = np.load(os.path.join(VOICE_DB_PATH, voice_file))
            
            # Calculate cosine similarity (1 - cosine distance)
            score = 1 - cosine(test_embedding, stored_embedding)
            all_scores[employee_id] = round(score, 3)
            print(f"[DEBUG] Voice match: {employee_id} = {score:.3f}")
            
            if score > best_score:
                best_score = score
                best_employee = employee_id
        
        print(f"[DEBUG] Best match: {best_employee} with score {best_score:.3f} (threshold: {SIMILARITY_THRESHOLD})")
        
        # Check if above threshold
        if best_score > SIMILARITY_THRESHOLD:
            return {
                "success": True,
                "identified": True,
                "employee_id": best_employee,
                "confidence": round(best_score * 100, 1),
                "message": f"Voice identified as {best_employee} with {round(best_score * 100, 1)}% confidence"
            }
        else:
            return {
                "success": True,
                "identified": False,
                "best_match": best_employee,
                "confidence": round(best_score * 100, 1),
                "message": f"Voice not recognized. Best match was {round(best_score * 100, 1)}% (threshold: {SIMILARITY_THRESHOLD * 100}%)"
            }
            
    except Exception as e:
        return {
            "success": False,
            "identified": False,
            "message": f"Failed to identify speaker: {str(e)}"
        }


def get_registered_voices() -> Dict:
    """Get list of all registered employee voices."""
    try:
        voice_files = [f for f in os.listdir(VOICE_DB_PATH) if f.endswith('.npy')]
        employee_ids = [f.replace(".npy", "") for f in voice_files]
        return {
            "success": True,
            "count": len(employee_ids),
            "employees": employee_ids
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def delete_voice(employee_id: str) -> Dict:
    """Delete a registered voice."""
    try:
        embedding_path = os.path.join(VOICE_DB_PATH, f"{employee_id}.npy")
        if os.path.exists(embedding_path):
            os.remove(embedding_path)
            return {"success": True, "message": f"Voice deleted for {employee_id}"}
        else:
            return {"success": False, "message": f"No voice found for {employee_id}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


# Test function
if __name__ == "__main__":
    print("Voice Service Test")
    print(f"Voice DB Path: {VOICE_DB_PATH}")
    print(f"Registered voices: {get_registered_voices()}")
