import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X, FileText, BookmarkCheck, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAgentChat, createConversation } from '../lib/agent-chat';
import type { MessageState } from '../lib/agent-chat';
import { createScenario } from '../api';
import type { AgentConfig, AgentRole, ScenarioType } from '../types';
import type { Briefing } from './CaseBriefing';
import { useStore } from '../store';
import { cn } from '../lib/utils';

interface AgentChatProps {
  agent: AgentConfig;
  onClose?: () => void;
  embedded?: boolean;
  initialContext?: Briefing;
  caseRef?: string;
  caseTitle?: string;
}

const ROLE_TO_SCENARIO_TYPE: Record<AgentRole, ScenarioType> = {
  defense: 'best',
  opposition: 'worst',
  judge: 'likely',
  analyst: 'likely',
};

const AgentChat: React.FC<AgentChatProps> = ({
  agent,
  onClose,
  embedded = false,
  initialContext,
  caseRef,
  caseTitle,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-save state
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const autoSaveFiredRef = useRef(false);
  const briefingSentRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const incrementNewScenarioCount = useStore((s) => s.incrementNewScenarioCount);

  const { sendMessage, messages, isConnected, error } = useAgentChat(agent.id, conversationId);

  // Derived state
  const isStreaming = messages.some((m) => m.role === 'assistant' && !m.isComplete);
  const connecting = initialising || (!isConnected && conversationId !== null);
  const isSending = isStreaming;

  // Typing indicator: last message is from user and no in-progress assistant message
  const agentTyping = isConnected && !isStreaming && messages.length > 0 &&
    messages[messages.length - 1].role === 'user';

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  // Create conversation on mount
  useEffect(() => {
    let cancelled = false;
    setInitialising(true);
    createConversation(agent.id)
      .then(({ conversationId: id }) => {
        if (!cancelled) setConversationId(id);
      })
      .catch(() => { /* error shown via hook */ })
      .finally(() => { if (!cancelled) setInitialising(false); });
    return () => { cancelled = true; };
  }, [agent.id]);

  // Auto-send briefing once connected
  useEffect(() => {
    if (!isConnected || briefingSentRef.current || !initialContext || !conversationId) return;
    briefingSentRef.current = true;
    sendMessage(buildBriefingMessage(initialContext)).catch(() => {});
  }, [isConnected, initialContext, conversationId, sendMessage]);

  // Auto-save: when the first assistant message completes, save it as a scenario
  useEffect(() => {
    if (!initialContext || !caseRef || autoSaveFiredRef.current) return;
    const firstAssistant = messages.find((m) => m.role === 'assistant' && m.isComplete);
    if (!firstAssistant) return;
    autoSaveFiredRef.current = true;
    setSaving(true);
    doAutoSave(firstAssistant.content, agent, caseRef, caseTitle || '', initialContext)
      .then((ok) => {
        setSaving(false);
        if (ok) {
          setSavedMsgId(firstAssistant.id);
          incrementNewScenarioCount();
        }
      })
      .catch(() => setSaving(false));
  }, [messages, initialContext, caseRef, caseTitle, agent, incrementNewScenarioCount]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !isConnected) return;
    const text = input.trim();
    setInput('');
    try {
      await sendMessage(text);
    } catch { /* error shown via hook */ }
  }, [input, isSending, isConnected, sendMessage]);

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

  const formatTime = () =>
    new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

  // Prepend greeting as a synthetic message (not from SDK)
  const greeting: MessageState = {
    id: 'greeting',
    role: 'assistant',
    content: getGreeting(agent.role),
    isComplete: true,
  };
  const allMessages: MessageState[] = conversationId ? [greeting, ...messages] : [];

  return (
    <div className={cn('flex flex-col bg-card border border-border', embedded ? 'h-full rounded-xl' : 'h-full')}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
        style={{ background: `${agent.color}12` }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${agent.color}25`, border: `1px solid ${agent.color}40` }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{agent.name}</p>
          <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {connecting
            ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a3e635' }} />
          }
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 border-b flex-shrink-0" style={{ backgroundColor: '#a3e63508', borderColor: '#a3e63520' }}>
        <p className="text-xs" style={{ color: '#a3e63580' }}>
          ⚠️ Simulation only. Not legal advice. All outputs are for preparation purposes.
        </p>
      </div>

      {/* Briefing + save status bar */}
      {initialContext && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-muted/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="w-3 h-3 flex-shrink-0" style={{ color: '#a3e635' }} />
              <span>
                <span className="font-medium" style={{ color: '#a3e635' }}>Briefing submitted</span>
                {' — '}
                {initialContext.evidence.length} evidence item{initialContext.evidence.length !== 1 ? 's' : ''}
              </span>
            </div>
            {saving && (
              <div className="flex items-center gap-1 text-xs" style={{ color: '#a3e635' }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving scenario…
              </div>
            )}
            {savedMsgId && !saving && (
              <div className="flex items-center gap-1 text-xs" style={{ color: '#a3e635' }}>
                <BookmarkCheck className="w-3 h-3" />
                Saved to Scenarios
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {connecting && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting to {agent.name}...
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg) => {
            const isBriefingUserMsg = msg.id.startsWith('user-briefing') ||
              (msg.role === 'user' && msg.content.startsWith('=== CASE BRIEFING ==='));
            const showSavedPill = savedMsgId && msg.id === savedMsgId && msg.isComplete;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex flex-col group', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${agent.color}25` }}
                    >
                      {agent.icon}
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-4 py-3 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm',
                      msg.id === savedMsgId && msg.isComplete ? 'ring-1 ring-primary/30' : ''
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {!msg.isComplete && (
                          <span className="inline-block w-1 h-4 bg-current animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : isBriefingUserMsg ? (
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="italic">Case briefing submitted to {agent.name}</span>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>

                {/* Timestamp + copy */}
                <div className={cn(
                  'flex items-center gap-1.5 mt-0.5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                  msg.role === 'assistant' ? 'ml-9' : ''
                )}>
                  <span className="text-[10px] text-muted-foreground">{formatTime()}</span>
                  {msg.role === 'assistant' && msg.isComplete && msg.id !== 'greeting' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-0.5 rounded hover:bg-muted transition-colors"
                    >
                      {copiedId === msg.id
                        ? <Check className="w-2.5 h-2.5" style={{ color: '#a3e635' }} />
                        : <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                      }
                    </button>
                  )}
                </div>

                {/* Saved pill */}
                <AnimatePresence>
                  {showSavedPill && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      className="ml-9 mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: '#a3e63518', border: '1px solid #a3e63535', color: '#a3e635' }}
                    >
                      <BookmarkCheck className="w-3 h-3" />
                      Saved to Scenario Branches
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {agentTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${agent.color}25` }}
              >
                {agent.icon}
              </div>
              <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl rounded-bl-sm bg-muted">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: agent.color }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
            {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connecting ? 'Connecting...' : `Message ${agent.name}...`}
            disabled={connecting || isSending}
            rows={1}
            className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 min-h-[44px] max-h-[120px]"
            style={{ overflow: 'hidden' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={connecting || isSending || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
            style={{ backgroundColor: agent.color }}
          >
            {isSending
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function doAutoSave(
  content: string,
  agent: AgentConfig,
  caseRef: string,
  caseTitle: string,
  briefing: Briefing
): Promise<boolean> {
  try {
    const scenarioType = ROLE_TO_SCENARIO_TYPE[agent.role as AgentRole];
    const firstLine = content
      .split('\n')
      .map((l) => l.replace(/^#+\s*/, '').trim())
      .find((l) => l.length > 4) || `${agent.name} Initial Assessment`;
    const title = `[${agent.name}] ${firstLine.slice(0, 80)}${firstLine.length > 80 ? '…' : ''}`;
    const summary = content
      .replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n+/g, ' ')
      .trim().slice(0, 400);
    const factors: string[] = [];
    if (briefing.allegations) factors.push(`Allegations: ${briefing.allegations.slice(0, 150).trim()}`);
    if (briefing.evidence.length > 0) factors.push(`Evidence: ${briefing.evidence.map((e) => e.title).join(', ')}`);
    await createScenario({
      title,
      caseReference: caseRef,
      scenarioType,
      probability: 'medium',
      summary,
      keyFactors: factors.join(' | '),
    });
    return true;
  } catch {
    return false;
  }
}

function buildBriefingMessage(briefing: Briefing): string {
  const lines: string[] = ['=== CASE BRIEFING ===', '', 'ALLEGATIONS / FACTS OF THE MATTER:', briefing.allegations.trim()];
  if (briefing.defenseSummary.trim()) {
    lines.push('', "CLIENT'S POSITION / DEFENSE SUMMARY:", briefing.defenseSummary.trim());
  }
  if (briefing.evidence.length > 0) {
    lines.push('', 'EVIDENCE PROVIDED:');
    briefing.evidence.forEach((item, i) => {
      lines.push(`${i + 1}. [${item.type.toUpperCase()}] ${item.title} (Side: ${item.side})`);
      if (item.description) lines.push(`   → ${item.description}`);
    });
  } else {
    lines.push('', 'EVIDENCE: None provided yet.');
  }
  lines.push('', '=== END OF BRIEFING ===', '', 'Please acknowledge receipt of this briefing and proceed with your role.');
  return lines.join('\n');
}

function getGreeting(role: string): string {
  switch (role) {
    case 'defense':
      return "Good day. I am your Defense Counsel.\n\nI have reviewed the case record. My role is to give you the strongest possible defense preparation — which means I will also tell you where your case is vulnerable.\n\nHow would you like to begin?";
    case 'opposition':
      return "I represent the opposing party in this matter.\n\nI have reviewed the same case record. My role here is to build the strongest possible case against your position — this is how you find your real vulnerabilities before the hearing.\n\nWhat would you like me to challenge?";
    case 'judge':
      return "This court is now in session.\n\nI have reviewed the case record. I will conduct this simulation with strict neutrality.\n\nHow would you like to proceed?";
    case 'analyst':
      return "Scenario analysis initialized.\n\nI synthesize the case record into scenario branches and actionable strategy intelligence.\n\nWhich output do you need?";
    default:
      return "Ready to assist.";
  }
}

export default AgentChat;
