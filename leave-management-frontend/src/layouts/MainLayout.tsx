import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { MessageSquare, Send, X, Bot, Sparkles, Database, Trash2, ArrowRight, Palmtree, Monitor, Calendar, Briefcase, ChevronRight, Circle } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessageInput('');
    setLoading(true);

    try {
      const response = await api.post('/leaves/ai-chat', { message: text });
      
      const botMsg: ChatMessage = {
        sender: 'bot',
        text: response.data.reply || 'Sorry, I encountered an issue parsing your request.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: '**Connection Error:** Failed to query the database. Please verify your connection status and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat history cleared!');
  };

  
  const formatBoldElements = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      return i % 2 === 1 ? <strong key={i} className="font-bold text-[#00236f]">{part}</strong> : part;
    });
  };

  
  const formatReplyText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-xs font-black text-[#00236f] uppercase tracking-wider mt-4 mb-1.5 flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-[#00236f]" /> {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={index} className="text-sm font-black text-[#00236f] uppercase tracking-wider mt-5 mb-2 border-b border-gray-100 pb-1">
            {line.replace('## ', '').replace('# ', '')}
          </h3>
        );
      }
      if (line.startsWith('* ')) {
        return (
          <div key={index} className="flex items-start gap-2 ml-1 my-1 text-xs text-gray-700">
            <span className="text-[#00236f] font-black shrink-0 mt-0.5">•</span>
            <span>{formatBoldElements(line.replace('* ', ''))}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-xs text-gray-600 leading-relaxed my-1">
          {formatBoldElements(line)}
        </p>
      );
    });
  };

  const suggestedQuestions = [
    { text: 'Who is on leave today?', icon: <Palmtree className="w-4 h-4" /> },
    { text: 'Who is out from IT team?', icon: <Monitor className="w-4 h-4" /> },
    { text: 'Plan me next long weekend', icon: <Calendar className="w-4 h-4" /> },
    { text: 'What is my leave balance?', icon: <Briefcase className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <main className="pb-24">
        <Outlet />
      </main>

      
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[150] w-14 h-14 bg-gradient-to-tr from-[#00236f] to-blue-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-none cursor-pointer group"
        title="Consult AI Leave Planner"
      >
        <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end font-sans">
          
          <div 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-blue-950/20 backdrop-blur-sm animate-in fade-in duration-300"
          />

          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            
            <div className="bg-[#00236f] p-6 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-inner text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold tracking-wider uppercase font-bebas">
                    OOO Assistant
                  </h3>
                  <div className="flex items-center gap-1 opacity-60">
                    <Database className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">Connected to DB <Circle className="w-2 h-2 fill-emerald-400" /></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all text-white border-none cursor-pointer"
                    title="Clear Conversation History"
                  >
                    <Trash2 className="w-4 h-4 opacity-75 hover:opacity-100" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all text-white border-none cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
              
              
              {messages.length === 0 && (
                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-[#00236f] rounded-xl flex items-center justify-center mb-4">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#00236f] mb-2">Instant Database Assistant</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Hello! I have secure, live access to our company database. Ask me coverage, planning, or balance questions to help schedule your rest!
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Suggested Queries
                    </h5>
                    <div className="grid grid-cols-1 gap-2.5">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q.text)}
                          className="bg-white hover:bg-blue-50/30 border border-gray-100 hover:border-[#00236f]/30 p-3.5 rounded-2xl text-left text-xs font-bold text-[#00236f] transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                        >
                          <span className="flex items-center gap-2">
                            <span>{q.icon}</span>
                            <span>{q.text}</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-xs relative overflow-hidden
                    ${m.sender === 'user' 
                      ? 'bg-gradient-to-tr from-[#00236f] to-blue-800 text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}
                  >
                    {m.sender === 'user' ? (
                      <p className="leading-relaxed font-semibold">{m.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {formatReplyText(m.text)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              
              {loading && (
                <div className="flex justify-start items-center gap-2 animate-pulse pl-2">
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-[#00236f]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-[#00236f] rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-[#00236f] rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-[#00236f] rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2.5 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                placeholder="Ask about IT team, balances, next holiday..."
                className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
              />
              <button
                onClick={() => handleSendMessage(messageInput)}
                disabled={!messageInput.trim() || loading}
                className="w-11 h-11 bg-gradient-to-tr from-[#00236f] to-blue-800 text-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50 disabled:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;