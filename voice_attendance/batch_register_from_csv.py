import os
import numpy as np
import pandas as pd
import torch
import torchaudio
from speechbrain.pretrained import SpeakerRecognition
import torchaudio
torchaudio.set_audio_backend("soundfile")

# Load model
model = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb"
)

DB_PATH = "voice_db"
os.makedirs(DB_PATH, exist_ok=True)

def get_embedding_from_file(path):
    signal, sr = torchaudio.load(path)

    # Convert to mono if stereo
    if signal.shape[0] > 1:
        signal = torch.mean(signal, dim=0, keepdim=True)

    # Resample to 16k if needed
    if sr != 16000:
        resampler = torchaudio.transforms.Resample(sr, 16000)
        signal = resampler(signal)

    # Normalize (very important)
    signal = signal / torch.max(torch.abs(signal))

    with torch.no_grad():
        emb = model.encode_batch(signal)

    return emb.squeeze().numpy()

# Read CSV
df = pd.read_csv("data.csv")

for _, row in df.iterrows():
    emp_id = str(row["emp_id"])
    audio_path = str(row["audio_path"]).strip().replace('"', '').replace("'", "")
    audio_path = os.path.normpath(audio_path)


    print(f"Processing {emp_id} → {audio_path}")

    emb = get_embedding_from_file(audio_path)
    np.save(f"{DB_PATH}/{emp_id}.npy", emb)

print("\n✅ All employees registered from CSV!")
