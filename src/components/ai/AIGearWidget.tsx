import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, X } from "lucide-react";
import { useStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import clsx from "clsx";

export default function AIGearWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{role: 'user'|'model', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [history, isLoading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history })
      });
      const data = await res.json();
      if (data.reply) {
        setHistory(prev => [...prev, { role: 'model', content: data.reply }]);
      }
    } catch(err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'model', content: "Sorry, I am having trouble connecting right now."}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Sparkles Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "fixed left-4 bottom-6 z-40 p-3 rounded-full shadow-xl transition-all duration-300",
          "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105",
          isOpen && "rotate-90 scale-90 opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Widget Panel */}
      <div 
        className={clsx(
          "fixed left-4 bottom-6 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
        )}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-semibold">
            <Bot className="h-5 w-5" />
            <span>Ami (AI Assistant)</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full text-slate-500 hover:text-red-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="space-y-4 pb-4">
            <div className="flex gap-2">
               <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%]">
                 Hi! I'm Ami, your Dr. HIA Academy assistant. Have questions about our science courses?
               </div>
            </div>
            {history.map((msg, i) => (
              <div key={i} className={clsx("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                 <div className={clsx(
                   "p-3 rounded-2xl text-sm max-w-[85%]",
                   msg.role === 'user' 
                    ? "bg-emerald-600 text-white rounded-tr-sm" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm"
                 )}>
                   {msg.content}
                 </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                 <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Ask about Chemistry, Biology..." 
              className="rounded-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            <Button type="submit" size="icon" disabled={!message.trim() || isLoading} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
