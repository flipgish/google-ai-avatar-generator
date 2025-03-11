import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { AvatarStyle } from '../types';

interface ChatInterfaceProps {
  avatarStyle: AvatarStyle;
  onRegenerateAvatar: () => void;
  onSendInstruction: (instruction: string) => void;
  isProcessing: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  avatarStyle, 
  onRegenerateAvatar, 
  onSendInstruction,
  isProcessing 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `I've created your avatar in ${avatarStyle} style! How would you like to modify it?`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || isAiTyping || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsAiTyping(true);

    // Send instruction to backend
    onSendInstruction(inputText);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string[]> = {
        pixar: [
          "I've made the eyes bigger for a more expressive look.",
          "I've adjusted the color palette to be warmer, giving it that Pixar glow.",
          "I've adjusted the facial proportions to be more stylized.",
        ],
        anime: [
          "I've made the eyes larger and more vibrant.",
          "I've created a more dramatic hairstyle as requested.",
          "I've added some anime-specific lighting effects.",
        ],
        simpsons: [
          "I've made the skin more yellow for that authentic Simpsons look.",
          "I've added an overbite for that classic Simpsons style.",
          "I've simplified the features for that iconic Simpsons look.",
        ],
        realistic: [
          "I've enhanced the skin texture for more realism.",
          "I've added more detailed lighting and shadows.",
          "I've adjusted the facial proportions to be more photorealistic.",
        ],
        cartoon: [
          "I've exaggerated some features for a more cartoony look.",
          "I've made the color palette more vibrant.",
          "I've simplified the shading for that classic cartoon style.",
        ],
        fantasy: [
          "I've added some fantasy elements like pointed ears.",
          "I've given it a more ethereal appearance.",
          "I've added some magical effects to enhance the fantasy theme.",
        ],
      };

      const randomResponse = aiResponses[avatarStyle][Math.floor(Math.random() * aiResponses[avatarStyle].length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-64 border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-3 bg-white">
        <div className="flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your instructions for the AI..."
            className="flex-1 border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            rows={1}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isAiTyping || isProcessing}
            className={`ml-2 p-2 rounded-full ${
              !inputText.trim() || isAiTyping || isProcessing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Send size={18} />
          </button>
          
          <button
            onClick={onRegenerateAvatar}
            disabled={isProcessing}
            className={`ml-2 p-2 rounded-full ${
              isProcessing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            }`}
            title="Regenerate Avatar"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;