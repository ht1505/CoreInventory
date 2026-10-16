'use client';

import { useState, useRef, useEffect } from 'react';
import axios from '@/lib/axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your inventory assistant. Ask me about stock levels, recent receipts, deliveries, or anything about your inventory.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await axios.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
        .chat-window { animation: fadeUp 0.2s ease; }
        .dot { animation: blink 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .chat-msg { line-height: 1.55; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
        .chat-input:focus { outline: none; border-color: #6366f1 !important; }
        .send-btn:hover { background: #4f46e5 !important; }
        .chat-fab:hover { transform: scale(1.08); box-shadow: 0 8px 30px rgba(99,102,241,0.5) !important; }
        .chat-fab { transition: all 0.2s ease; }
        .close-btn:hover { background: #1f2937 !important; }
      `}</style>

      {/* Floating Action Button */}
      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="chat-window"
          style={{
            position: 'fixed', bottom: '88px', right: '24px', zIndex: 999,
            width: '360px', height: '500px',
            background: '#111118', borderRadius: '16px',
            border: '1px solid #1f2937',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'DM Sans', sans-serif",
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #1f2937',
            background: '#0d0d14',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10"/>
                <path d="M12 8v4l3 3"/>
                <circle cx="19" cy="5" r="3" fill="#34d399" stroke="none"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#fff' }}>Inventory Assistant</div>
              <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Online
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => setOpen(false)}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#6b7280' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  className="chat-msg"
                  style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1a1a26',
                    color: msg.role === 'user' ? '#fff' : '#d1d5db',
                    border: msg.role === 'assistant' ? '1px solid #1f2937' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#1a1a26', border: '1px solid #1f2937', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #1f2937', display: 'flex', gap: '8px', background: '#0d0d14' }}>
            <input
              ref={inputRef}
              className="chat-input"
              type="text"
              placeholder="Ask about inventory..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1, background: '#111118', border: '1px solid #1f2937',
                borderRadius: '10px', padding: '9px 13px',
                color: '#fff', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: input.trim() ? '#6366f1' : '#1f2937',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}