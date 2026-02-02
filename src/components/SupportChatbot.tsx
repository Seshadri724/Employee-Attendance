import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage, checkChatbotHealth } from '../api/chatApi';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

export default function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! 👋 I'm the CARIVIX Support Assistant. How can I help you with attendance today?",
            isBot: true,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Check if chatbot service is available
        checkChatbotHealth().then(setIsOnline);
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue.trim(),
            isBot: false,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(userMessage.text);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.success
                    ? response.response || "I'm not sure how to respond to that."
                    : response.error || 'Sorry, something went wrong.',
                isBot: true,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Unable to connect to the chatbot service. Please try again later.',
                isBot: true,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${isOpen ? 'scale-0' : 'scale-100'
                    }`}
                aria-label="Open chat"
            >
                <MessageCircle className="w-6 h-6 text-white" />
                {!isOnline && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Support Assistant</h3>
                            <p className="text-white/70 text-xs">
                                {isOnline ? '🟢 Online' : '🔴 Offline'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/70 hover:text-white transition"
                        aria-label="Close chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`flex items-start gap-2 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    {message.isBot ? (
                                        <Bot className="w-4 h-4 text-white" />
                                    ) : (
                                        <User className="w-4 h-4 text-gray-600" />
                                    )}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl ${message.isBot
                                            ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${message.isBot ? 'text-gray-400' : 'text-white/70'
                                            }`}
                                    >
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about attendance..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        Ask me about attendance, check-in, or support
                    </p>
                </div>
            </div>
        </>
    );
}
