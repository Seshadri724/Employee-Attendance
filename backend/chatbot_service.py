"""
Chatbot Service for CARIVIX Attendance Management System
Uses TF-IDF + Cosine Similarity for question matching
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---- Attendance System FAQs ----
questions = [
    "How do users mark their attendance",
    "How do I check in",
    "How do I check out",
    "Does the system support real-time attendance tracking",
    "Is user data secure",
    "Is an internet connection required",
    "I am unable to log into the application. What should I do",
    "The application is not loading properly",
    "Attendance is not getting marked",
    "My attendance record is missing",
    "Login Issues",
    "Attendance Not Marked",
    "Support Contact",
    "What devices are supported by the system",
    "Do I need to install any software",
    "Why does the system ask for camera or location permission",
    "How can I check if my attendance was successfully recorded",
    "What is voice attendance",
    "How does voice attendance work",
    "How do I register my voice",
    "Voice not recognized",
    "What are the working hours",
    "Can I mark attendance from home",
    "What happens if I forget to check out",
]

answers = [
    "Users can mark attendance by logging into the application and using available options such as a check-in/check-out button, QR code scanning, biometric integration, or voice-based verification.",
    "To check in, log into your account and click the blue 'Check In Now' button on your dashboard. You can also use the voice command feature by saying 'check in'.",
    "To check out, click the green 'Check Out Now' button on your dashboard after you've checked in. You can also use voice commands.",
    "Yes, attendance data is updated instantly, allowing administrators to view real-time status such as present, absent, late, or on leave.",
    "Yes, the application uses secure authentication, encrypted data storage, and role-based access control to protect user information and prevent unauthorized access.",
    "An internet connection is generally required to sync data with the server. However, data is also stored locally for offline access.",
    "Ensure that you are entering the correct username and password. Check if the Caps Lock key is turned on. If you forgot your password, contact your system administrator.",
    "Check your internet connection and refresh the page. Clear browser cache and cookies, or try opening the application in a different browser or device.",
    "Make sure you are logged in correctly and have the required permission to mark attendance. Verify that the date and time settings on your device are correct. Try refreshing the page.",
    "Refresh the page and check the selected date range. If the record is still missing, report the issue to the administrator.",
    "If you are unable to log in, ensure that your username and password are correct. Check whether the Caps Lock key is enabled. Contact the system administrator if the issue continues.",
    "Ensure you are logged in with the correct account and have permission to mark attendance. Verify that your system date and time are correct. Refresh the page and try again.",
    "For technical assistance, contact: System Administrator / IT Support Team Email: support@carivix.com",
    "The system works on desktops, laptops, tablets, and smartphones with a modern web browser such as Chrome, Edge, or Firefox.",
    "No additional software installation is required. The system can be accessed directly through a web browser.",
    "Camera access is required for QR code scanning or face verification. Location access may be used to confirm that attendance is marked from an authorized workplace location.",
    "After marking attendance, you can verify the entry in your attendance history or dashboard. Look for your check-in time displayed on the screen.",
    "Voice attendance is a contactless way to mark your attendance using your unique voice biometrics. Just speak for a few seconds and the system identifies you.",
    "Voice attendance works by comparing your voice with a stored voice profile. When you speak, the system extracts unique characteristics from your voice and matches them with registered profiles.",
    "To register your voice, contact your administrator. They will record a 4-second voice sample where you say 'Good morning, this is [your name], marking my attendance.'",
    "If your voice is not recognized, try speaking clearly in a quiet environment. Make sure you're speaking at a normal pace. If issues persist, contact your administrator to re-register your voice.",
    "Working hours are typically 9 AM to 6 PM. Check with your administrator for your organization's specific schedule.",
    "Remote attendance marking depends on your organization's policy. Some organizations allow location-based verification for remote work.",
    "If you forget to check out, the system may mark you as present for the full day or require manual correction. Contact your administrator to update the record.",
]

# Initialize the vectorizer with the questions
vectorizer = TfidfVectorizer()
question_vectors = vectorizer.fit_transform(questions)


def get_chatbot_response(user_input: str) -> str:
    """
    Get a response for the user's input using TF-IDF similarity matching.
    
    Args:
        user_input: The user's question or message
        
    Returns:
        The best matching answer or a fallback message
    """
    if not user_input or not user_input.strip():
        return "Please type a question and I'll help you with your attendance-related queries."
    
    # Handle greetings
    greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
    user_lower = user_input.lower().strip()
    
    for greeting in greetings:
        if user_lower.startswith(greeting):
            return "Hello! 👋 I'm the CARIVIX Support Assistant. How can I help you with attendance today?"
    
    # Handle thank you
    if 'thank' in user_lower:
        return "You're welcome! Let me know if you have any other questions about the attendance system."
    
    # Handle bye
    if user_lower in ['bye', 'goodbye', 'see you', 'exit', 'quit']:
        return "Goodbye! Have a great day! 👋"
    
    # Transform user input and find similarity
    user_vector = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vector, question_vectors)
    
    idx = similarities.argmax()
    score = similarities[0][idx]
    
    if score > 0.25:
        return answers[idx]
    else:
        return "I'm sorry, I couldn't find an answer to that question. Please try rephrasing, or contact support@carivix.com for assistance."


# Test function
if __name__ == "__main__":
    test_questions = [
        "Hello",
        "How do I mark attendance?",
        "What is voice attendance?",
        "My login is not working",
        "random gibberish xyz",
    ]
    
    for q in test_questions:
        print(f"Q: {q}")
        print(f"A: {get_chatbot_response(q)}")
        print("-" * 50)
