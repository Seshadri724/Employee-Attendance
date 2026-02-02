import os
import numpy as np
import torch
import sounddevice as sd
from scipy.spatial.distance import cosine
from speechbrain.pretrained import SpeakerRecognition
from datetime import datetime

model = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb"
)

DB_PATH = "voice_db"
THRESHOLD = 0.50   # ✅ more practical
FS = 16000
SECONDS = 4

def record_clean_audio():
    print("🎙️ Speak to mark attendance...")
    audio = sd.rec(int(SECONDS * FS), samplerate=FS, channels=1, dtype='float32')
    sd.wait()
    audio = np.squeeze(audio)

    # ✅ Normalize
    audio = audio / np.max(np.abs(audio))

    tensor = torch.tensor(audio).unsqueeze(0)
    return tensor

def get_embedding(tensor_audio):
    with torch.no_grad():
        emb = model.encode_batch(tensor_audio)
    return emb.squeeze().numpy()

test_audio = record_clean_audio()
test_emb = get_embedding(test_audio)

best_score = 0
best_emp = None

for file in os.listdir(DB_PATH):
    emp_id = file.replace(".npy", "")
    stored_emb = np.load(os.path.join(DB_PATH, file))

    score = 1 - cosine(test_emb, stored_emb)
    

    if score > best_score:
        best_score = score
        best_emp = emp_id
        print(f"{emp_id} → score: {score:.3f}")

if best_score > THRESHOLD:
    print(f"\n✅ Attendance Marked for {best_emp}")
    print("🕒", datetime.now())
else:
    print("\n❌ Voice not recognized")
