from customerSupportChatbot import text_chat, voice_chat

# -------- TEXT TEST --------
print("TEXT TEST")
text = input()
response = text_chat(text)
print("Bot:", response)

# -------- VOICE TEST --------
print("\nVOICE TEST (speak now)")
result = voice_chat()
print(result)
