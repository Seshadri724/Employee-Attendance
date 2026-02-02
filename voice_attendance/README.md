# 🎙️ Voice-Based Attendance Management System

A contactless attendance system that identifies employees using **voice biometrics** instead of face, RFID, or fingerprint.

Built with:
- SpeechBrain ECAPA-TDNN (Speaker Recognition)
- PyTorch
- Python, NumPy, SoundDevice

---

## 🚀 Features

- No camera required
- Works with just a microphone
- Only 4 seconds of speech needed
- Stores only embeddings (no raw audio)
- Fast recognition (≤ 3 seconds)

---

## 📁 Project Structure
voice_attendance/
│
├── mark_attendance_live.py
├── batch_register_from_csv.py
├── requirements.txt
├── employees.csv
├── voice_db/ # auto-generated embeddings


---

## 🧠 How It Works

1. Employee voice (4 sec) → converted to speaker embedding
2. Embedding stored as `.npy`
3. During attendance → live voice compared with stored embeddings
4. If similarity > threshold → attendance marked

---

## ⚙️ Installation (Important Order)

pip install torch==2.1.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

🗣️ Voice Recording Rule

Each employee must say for ~4 seconds:

"Good morning, this is <name>, marking my attendance."

1. Audio must be:
2. WAV format
3. Mono
4. 16 kHz
5. Quiet environment
6. No silence at start/end

## Batch Registration (from CSV)

python batch_register_from_csv.py

## ✅ Mark Attendance (Live)

python mark_attendance_live.py
