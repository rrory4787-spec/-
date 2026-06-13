import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Search, 
  Plus, 
  MoreVertical, 
  MessageSquare,
  ShieldCheck,
  Zap,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { fetchMessages, sendMessage } from '../lib/db';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export function MessagesView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    
    const senderId = user.id || user.User_Email;
    const senderName = user.name || user.User_Name || 'عضو المجتمع';

    const newMessage = {
      senderId,
      senderName,
      text: inputText,
      timestamp: Date.now()
    };
    
    try {
      const savedMsg = await sendMessage(newMessage);
      setMessages([...messages, savedMsg]);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col h-full pb-20 lg:pb-0">
      {/* Messages Header */}
      <div className="p-4 border-b border-gray-800 bg-[#0F0F0F] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">الديوان العام للمشتركين</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              قناة مشفرة (AES-256)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-gray-500"><Search className="h-5 w-5" /></Button>
           <Button variant="ghost" size="icon" className="text-gray-500"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#C5A059] animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === (user?.id || user?.User_Email) ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isSystem ? (
                <div className="w-full flex justify-center">
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[11px] text-gray-500 flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.senderId === (user?.id || user?.User_Email) 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#1A1A1A] text-gray-200 border border-gray-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black opacity-50">{msg.senderName}</span>
                    {msg.senderId === 'admin' && <ShieldCheck className="h-3 w-3 text-[#C5A059]" />}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] mt-2 block opacity-40 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>

      {/* Message Input */}
      <div className="p-4 bg-[#0F0F0F] border-t border-gray-800 flex gap-3">
        <Button variant="ghost" size="icon" className="text-gray-500 shrink-0"><Plus className="h-6 w-6" /></Button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالتك لشركاء السيادة..."
          className="flex-1 bg-black border border-gray-800 rounded-xl px-4 text-white text-sm focus:border-[#C5A059] outline-none h-12 transition-all"
        />
        <Button 
          onClick={handleSend}
          className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-black px-6 h-12 rounded-xl shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
