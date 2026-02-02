import speech_recognition as sr
import pyttsx3
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---- chatbot data ----
questions = [
    "How do users mark their attendance",
    "Does the system support real-time attendance tracking",
    "Is user data secure",
    "Is an internet connection required",
    "I am unable to log into the application. What should I do",
    "The application is not loading properly.",
    "Attendance is not getting marked.",
    "My attendance record is missing.",
    "Login Issues",
    "Attendance Not Marked",
    "Support Contact",
    "What devices are supported by the system?",
    "Do I need to install any software?",
    "Why does the system ask for camera or location permission?",
    "How can I check if my attendance was successfully recorded?"
]

answers = [
    "Users can mark attendance by logging into the application and using available options such as a check-in/check-out button, QR code scanning, biometric integration, or location-based verification, depending on the system configuration.",
    "Yes, attendance data is updated instantly, allowing administrators to view real-time status such as present, absent, late, or on leave.",
    "Yes, the application uses secure authentication, encrypted data storage, and role-based access control to protect user information and prevent unauthorized access.",
    "An internet connection is generally required to sync data with the server. However, some versions may support offline mode with automatic synchronization when the connection is restored.",
    "Ensure that you are entering the correct username and password. Check if the Caps Lock key is turned on. If you forgot your password, use the “Forgot Password” option to reset it. If the issue persists, contact the system administrator.",
    "Check your internet connection and refresh the page. Clear browser cache and cookies, or try opening the application in a different browser or device.",
    "Make sure you are logged in correctly and have the required permission to mark attendance. Verify that the date and time settings on your device are correct. Try refreshing the page and attempt again.",
    "Refresh the page and check the selected date range. If the record is still missing, report the issue to the administrator.",
    "If you are unable to log in, ensure that your username and password are correct. Check whether the Caps Lock key is enabled. If you have forgotten your password, use the “Forgot Password” option to reset it. If the issue continues, contact the system administrator.",
    "Ensure you are logged in with the correct account and have permission to mark attendance. Verify that your system date and time are correct. Refresh the page and try again.",
    "For technical assistance, contact: System Administrator / IT Support Team Email: support@carivix.com Phone: +91-XXXXXXXXXX ",
    "The system works on desktops, laptops, tablets, and smartphones with a modern web browser such as Chrome, Edge, or Firefox.",
    "No additional software installation is required. The system can be accessed directly through a web browser. If a mobile app is provided, it can be installed from the official app store.",
    "Camera access is required for QR code scanning or face verification. Location access may be used to confirm that attendance is marked from an authorized workplace location.",
    "After marking attendance, you can verify the entry in your attendance history or dashboard."
]

vectorizer = TfidfVectorizer()
question_vectors = vectorizer.fit_transform(questions)

def text_chat(user_message):
    response = get_response(user_message)
    return response


# ---- speech engine ----

def speak(text):
    engine.say(text)
    engine.runAndWait()

# ---- speech input ----
recognizer = sr.Recognizer()
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

def voice_chat():
    with sr.Microphone() as source:
        print("Listening...")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio)
        print("User said:", text)

        response = get_response(text)

        #speak(response)
        return {
            "user_text": text,
            "bot_response": response
        }

    except:
        return {
            "error": "Could not understand audio"
        }

# ---- chatbot logic ----
def get_response(user_input):
    user_vector = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vector, question_vectors)

    idx = similarities.argmax()
    score = similarities[0][idx]

    if score > 0.3:
        return answers[idx]
    else:
        return "Sorry, I couldn't understand."

