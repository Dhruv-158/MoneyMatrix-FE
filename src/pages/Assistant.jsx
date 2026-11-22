import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bot, Send, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import toastService from '@/services/toastService';
import { chatWithAssistant } from '@/services/aiClient';

export default function Assistant() {
  const { token } = useSelector((s) => s.auth);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi — I am your MoneyMatrix assistant. Ask me to add expenses, check balances, or summarize spending.',
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);
    try {
      const reply = await chatWithAssistant(token, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err?.errorMessage || 'Something went wrong. Please try again.';
      toastService.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — ${msg}${err?.requestId ? ` (ref: ${err.requestId})` : ''}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto"
    >
      <PageHeader
        title="AI Assistant"
        subtitle="Chat with MoneyMatrix using your linked LLM key. Destructive deletes require a Yes/No confirmation."
      />

      <div className="flex-1 mt-4 rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider font-bold opacity-70">
                    <Bot className="w-3 h-3" aria-hidden />
                    Assistant
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-border p-3 flex gap-2 items-center bg-background/80"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Message to AI assistant
          </label>
          <input
            id="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Add expense 250 for food from HDFC"
            disabled={sending}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-500 transition"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
