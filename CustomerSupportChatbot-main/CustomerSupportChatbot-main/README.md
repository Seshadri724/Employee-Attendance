
# Customer Service Chatbot (Text + Voice)

A simple NLP-based customer service chatbot built in Python.  
It answers predefined customer questions using both text and voice input.

This project is designed as a beginner-friendly backend chatbot that can later be connected to a web or mobile frontend.

---

# 📌 Features

- Predefined Question–Answer system  
- NLP matching using TF-IDF + cosine similarity  
- Text chat support  
- Voice input (speech-to-text)  
- Voice output (text-to-speech)  
- Modular backend design for easy integration  

---

# 📂 Project Structure



project-folder/
│
├── customerSupportChatbot.py   # Main chatbot logic
├── test_bot.py          # Script to test chatbot
└── README.md            # Documentation



---

# ⚙️ Requirements

- Python 3.8 or higher  
- Microphone (for voice mode)  
- Internet connection (for speech recognition)

---

# 📦 Installation

## Step 1 — Clone Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


Or download ZIP and extract.

---

## Step 2 — Install Dependencies

```bash
pip install scikit-learn SpeechRecognition pyttsx3 pyaudio
```

---

## 🎤 Fix PyAudio Installation (Windows)

If PyAudio fails to install:

```bash
pip install pipwin
pipwin install pyaudio
```

---

# ▶️ Running the Chatbot

## Run Test Script

```bash
python test_bot.py
```

This script will test:

* Text chat
* Voice chat

---

# 💬 Text Chat Example

```python
from customerSuppoerChatbot import text_chat

response = text_chat("how can i track my order")
print(response)
```

Example Output:

```
You can track your order using the tracking link sent to your email.
```

---

# 🎤 Voice Chat Example

```python
from customerSuppoerChatbot import voice_chat

result = voice_chat()
print(result)
```

How it works:

1. Microphone listens
2. Speech converts to text
3. Bot finds best answer
4. Bot speaks response

---

# 🛠 Customizing Questions & Answers

Open `customerSuppoerChatbot.py` and edit:

```python
questions = [
    "what are your working hours",
    "how can i track my order"
]

answers = [
    "We work from 9 AM to 6 PM.",
    "Use the tracking link sent to your email."
]
```

Important Rules:

* Questions and answers must match by index
* Add multiple question variations for better results

---

# 🚀 Future Improvements

* FastAPI/Flask API integration
* Database storage for Q&A
* Intent classification
* Context awareness
* Web or mobile frontend
* LLM-based responses

---

# ❗ Troubleshooting

### Microphone Not Working

Check system permissions and default mic settings.

### Speech Recognition Not Working

Ensure internet connection is active.

### Module Not Found Error

```bash
pip install -r requirements.txt
```

Or reinstall libraries manually.

