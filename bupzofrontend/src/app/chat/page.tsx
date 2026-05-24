"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Chat Components
const ChatSidebar = ({ activeChats, onSelectChat }: { activeChats: any[]; onSelectChat: (chat: any) => void }) => {
  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Active Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {activeChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-slate-50 ${
              chat.selected ? 'bg-indigo-50' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              chat.unread ? 'bg-indigo-600' : 'bg-slate-200'
            }`}>
              <span className="text-white text-sm">{chat.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-slate-800">{chat.name}</div>
              <div className="text-xs text-slate-500 truncate">{chat.lastMessage}</div>
            </div>
            {chat.unread && (
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 mb-2">Online</div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const ChatWorkspace = ({ chat, messages, onSendMessage, isGenerating, smartReplies }: { chat: any; messages: any[]; onSendMessage: (message: string) => void; isGenerating: boolean; smartReplies: string[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600">{chat.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800">{chat.name}</div>
            <div className="text-xs text-slate-500">Online</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
              }`}
            >
              {message.text}
              {message.type === 'image' && (
                <div className="mt-2">
                  <img
                    src={message.text}
                    alt="Attachment"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              {message.type === 'file' && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-slate-500">📄</span>
                  <span className="text-sm">{message.text}</span>
                </div>
              )}
              <div className="text-xs mt-1 text-right">
                {new Date(message.time).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-100 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                <span className="text-sm">Mistral AI is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="space-y-3">
          {smartReplies.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {smartReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(reply)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full hover:bg-indigo-200"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
              <span className="text-slate-500">📎</span>
            </button>
            <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
              <span className="text-slate-500">😊</span>
            </button>
            <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
              <span className="text-slate-500">📷</span>
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage(e.target.value)}
            />
            <button
              onClick={() => onSendMessage("")}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <span>💬</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [activeChats, setActiveChats] = useState<any[]>([
    { id: 'chat1', name: 'Asha R.', lastMessage: 'Hello, I have a question about my order...', unread: true, selected: true },
    { id: 'chat2', name: 'John D.', lastMessage: 'Can you help me with the return process?', unread: false, selected: false },
    { id: 'chat3', name: 'Sarah L.', lastMessage: 'I need to update my shipping address...', unread: false, selected: false },
  ]);

  const [selectedChat, setSelectedChat] = useState<any>(activeChats[0]);
  const [messages, setMessages] = useState<any[]>([
    { id: 'msg1', sender: 'bot', text: 'Hello! How can I help you today?', time: new Date().toISOString(), type: 'text' },
    { id: 'msg2', sender: 'user', text: 'I have a question about my recent order #ORD1001', time: new Date().toISOString(), type: 'text' },
    { id: 'msg3', sender: 'bot', text: 'I can see that order was placed on May 22nd. What specific question do you have?', time: new Date().toISOString(), type: 'text' },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

async function sendMessage(text: string) {
    if (text.trim() === '') return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toISOString(),
      type: 'text'
    };
    setMessages([...messages, userMessage]);
    setIsGenerating(true);

    try {
      // Generate smart replies
      const smartRepliesResponse = await axios.post('/api/agents/chat', {
        context: `User: ${selectedChat.name}, Message: "${text}"`,
        task: 'smart_replies',
        format: 'text-only'
      });

      const smartRepliesResult = smartRepliesResponse.data.result;
      // Parse smart replies (simplified for demo)
      const replies: string[] = smartRepliesResult.split('\n').filter((r: string) => r.trim() !== '').slice(0, 3);
      setSmartReplies(replies);

      // Simulate bot response after a delay
      setTimeout(() => {
        const botMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: `I understand your concern about order #ORD1001. Let me check the details for you...`,
          time: new Date().toISOString(),
          type: 'text'
        };
        setMessages([...messages, userMessage, botMessage]);
      }, 1000);
    } catch (err: any) {
      alert('Mistral AI Error: ' + (err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Phoenix Header */}
      <header className="w-full bg-white shadow-sm border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Chat</h1>
            <p className="text-sm text-slate-600">Customer support workspace</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex">
        {/* Chat Sidebar */}
        <ChatSidebar
          activeChats={activeChats}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setActiveChats(activeChats.map(c => ({ ...c, selected: c.id === chat.id })));
          }}
        />

        {/* Chat Workspace */}
        <ChatWorkspace
          chat={selectedChat}
          messages={messages}
          onSendMessage={sendMessage}
          isGenerating={isGenerating}
          smartReplies={smartReplies}
        />
      </div>
    </div>
  );
}