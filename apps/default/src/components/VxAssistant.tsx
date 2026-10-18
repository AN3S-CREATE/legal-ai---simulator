import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Minimize2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAgentChat, createConversation } from '../lib/agent-chat';
import type { MessageState } from '../lib/agent-chat';
import { cn } from '../lib/utils';

const ASSISTANT_AGENT_ID = '01KKRZ40NHJHCV4K0PJT3NB5TH';

const STARTER_PROMPTS = [
  { label: 'Best case outcome', prompt: 'What is the best realistic outcome I can expect in a labour dispute dismissal case?' },
  { label: 'Key preparation steps', prompt: 'Walk me through the key steps to prepare for an unfair dismissal hearing.' },
  { label: 'Evidence checklist', prompt: 'What evidence is typically crucial in a commercial contract dispute?' },
  { label: 'SA procedural rules', prompt: 'Explain the procedural rules for filing at the CCMA in South Africa.' },
];

const VxAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [initialising, setInitialising] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasOpened = useRef(false);

  const { sendMessage, messages, isConnected, error } = useAgentChat(
    ASSISTANT_AGENT_ID,
    conversationId,
  );

  // Determine if agent is currently generating
  const isStreaming = messages.some((m) => m.role === 'assistant' && !m.isComplete);
  const isDisabled = !isConnected || isStreaming || initialising;

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [messages, isStreaming]);

  // Create conversation when panel first opens
  useEffect(() => {
    if (!open || hasOpened.current) return;
    hasOpened.current = true;
    setInitialising(true);
    createConversation(ASSISTANT_AGENT_ID)
      .then(({ conversationId: id }) => {
        setConversationId(id);
      })
      .catch(() => {
        // will show error from hook
      })
      .finally(() => setInitialising(false));
  }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isDisabled) return;
    setInput('');
    try {
      await sendMessage(msg);
    } catch {
      // error shown via hook
    }
  }, [input, isDisabled, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* noop */ }
  };

  const formatTime = (id: string) => {
    // ULID encodes timestamp — extract first 10 chars as approximate time
    try {
      return new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const connecting = initialising || (!isConnected && conversationId !== null);
  const hasUserMessages = messages.some((m) => m.role === 'user');

  // Typing indicator: connected but last message is user and no in-progress assistant
  const agentTyping = isConnected && !isStreaming && messages.length > 0 &&
    messages[messages.length - 1].role === 'user';

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => { setOpen(true); setMinimised(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)',
              boxShadow: '0 4px 24px rgba(163,230,53,0.45), 0 2px 8px rgba(0,0,0,0.4)',
            }}
            title="Open Veralogix Assistant"
          >
            <Sparkles className="w-6 h-6 text-black" />
            <span
              className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ backgroundColor: '#a3e635' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, height: minimised ? 56 : 580 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: 'clamp(320px, 30vw, 400px)',
              background: 'rgba(10,10,10,0.96)',
              border: '1px solid rgba(163,230,53,0.25)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(163,230,53,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              style={{ borderBottom: minimised ? 'none' : '1px solid rgba(163,230,53,0.12)' }}
              onClick={() => setMinimised((m) => !m)}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)' }}
              >
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground leading-none">
                  VERA<span className="opacity-50 font-normal">LOGIX</span>
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#a3e63580' }}>Legal AI Assistant</p>
              </div>

              {/* Status dot */}
              {connecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: '#a3e635' }} />
              ) : isConnected ? (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#a3e635', boxShadow: '0 0 6px #a3e635aa' }}
                />
              ) : null}

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setMinimised((m) => !m)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {minimised ? <MessageSquare className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!minimised && (
                <motion.div
                  key="body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* Disclaimer */}
                  <div className="flex-shrink-0 px-4 py-1.5" style={{ borderBottom: '1px solid rgba(163,230,53,0.08)' }}>
                    <p className="text-[10px]" style={{ color: '#a3e63540' }}>⚠️ Simulation only · Not legal advice</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                    {connecting && (
                      <div className="flex justify-center py-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Connecting to Legal Assistant…
                        </div>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {messages.map((msg: MessageState) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className={cn('flex flex-col group', msg.role === 'user' ? 'items-end' : 'items-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm',
                              msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                            )}
                            style={
                              msg.role === 'user'
                                ? { background: 'linear-gradient(135deg, #a3e635, #65a30d)', color: '#000' }
                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--foreground))' }
                            }
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                {!msg.isComplete && (
                                  <span className="inline-block w-0.5 h-3.5 bg-current animate-pulse ml-0.5 align-middle" />
                                )}
                              </div>
                            ) : (
                              <p className="text-[13px] leading-relaxed">{msg.content}</p>
                            )}
                          </div>

                          {/* Timestamp + copy */}
                          <div className={cn(
                            'flex items-center gap-1.5 mt-0.5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                            msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          )}>
                            <span className="text-[10px] text-muted-foreground">{formatTime(msg.id)}</span>
                            {msg.role === 'assistant' && msg.isComplete && (
                              <button onClick={() => handleCopy(msg.id, msg.content)} className="p-0.5 rounded hover:bg-white/10 transition-colors">
                                {copiedId === msg.id
                                  ? <Check className="w-2.5 h-2.5" style={{ color: '#a3e635' }} />
                                  : <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                                }
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {agentTyping && (
                        <motion.div
                          key="typing"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="flex items-center gap-1 px-3 py-2 rounded-xl rounded-bl-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            {[0, 0.15, 0.3].map((delay, i) => (
                              <motion.span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: '#a3e635' }}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">thinking…</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
                        {error.message}
                      </div>
                    )}

                    {/* Starter prompts */}
                    {!hasUserMessages && !connecting && isConnected && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-1.5 pt-1"
                      >
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold px-0.5">Quick starts</p>
                        {STARTER_PROMPTS.map((sp) => (
                          <button
                            key={sp.label}
                            onClick={() => handleSend(sp.prompt)}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                            style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.18)', color: '#a3e63599' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(163,230,53,0.12)'; e.currentTarget.style.color = '#a3e635'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(163,230,53,0.06)'; e.currentTarget.style.color = '#a3e63599'; }}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={connecting ? 'Connecting…' : 'Ask anything about your case…'}
                        disabled={isDisabled}
                        rows={1}
                        className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[40px] max-h-[100px]"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          overflow: 'hidden',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(163,230,53,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(163,230,53,0.12)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        onInput={(e) => {
                          const t = e.currentTarget;
                          t.style.height = 'auto';
                          t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
                        }}
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={isDisabled || !input.trim()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #a3e635, #65a30d)',
                          boxShadow: input.trim() && !isDisabled ? '0 2px 12px rgba(163,230,53,0.35)' : 'none',
                        }}
                      >
                        {isStreaming ? (
                          <Loader2 className="w-4 h-4 text-black animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 text-black" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VxAssistant;
