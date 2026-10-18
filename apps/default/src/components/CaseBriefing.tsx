import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Paperclip,
} from 'lucide-react';
import type { AgentConfig, EvidenceType, Side } from '../types';
import { cn } from '../lib/utils';

export interface EvidenceEntry {
  id: string;
  title: string;
  type: EvidenceType;
  side: Side;
  description: string;
}

export interface Briefing {
  allegations: string;
  defenseSummary: string;
  evidence: EvidenceEntry[];
}

interface CaseBriefingProps {
  agent: AgentConfig;
  caseTitle: string;
  caseNumber: string;
  onSubmit: (briefing: Briefing) => void;
}

const EVIDENCE_TYPES: EvidenceType[] = ['doc', 'witness', 'photo', 'audio', 'expert', 'digital'];
const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  doc: 'Document',
  witness: 'Witness Statement',
  photo: 'Photograph',
  audio: 'Audio / Video',
  expert: 'Expert Report',
  digital: 'Digital Evidence',
};

const CaseBriefing: React.FC<CaseBriefingProps> = ({
  agent,
  caseTitle,
  caseNumber,
  onSubmit,
}) => {
  const [allegations, setAllegations] = useState('');
  const [defenseSummary, setDefenseSummary] = useState('');
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([]);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [newEvidence, setNewEvidence] = useState<Omit<EvidenceEntry, 'id'>>({
    title: '',
    type: 'doc',
    side: 'defense',
    description: '',
  });

  const addEvidence = () => {
    if (!newEvidence.title.trim()) return;
    setEvidence((prev) => [
      ...prev,
      { ...newEvidence, id: `ev-${Date.now()}` },
    ]);
    setNewEvidence({ title: '', type: 'doc', side: 'defense', description: '' });
    setShowEvidenceForm(false);
  };

  const removeEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  };

  const canSubmit = allegations.trim().length > 10;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ allegations, defenseSummary, evidence });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 py-4 border-b border-border"
        style={{ background: `${agent.color}10` }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${agent.color}25`, border: `1px solid ${agent.color}40` }}
          >
            {agent.icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{agent.name}</p>
            <p className="text-xs text-muted-foreground">Case Briefing Required</p>
          </div>
        </div>
      </div>

      {/* Instruction banner */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ backgroundColor: '#a3e63508', borderColor: '#a3e63520' }}>
        <div className="flex gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#a3e635' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#a3e63580' }}>
            Brief the {agent.name} with your allegations and evidence before the session begins. The AI will use this as the full case context.
          </p>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">

        {/* Case reference */}
        <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border">
          <p className="text-xs text-muted-foreground mb-0.5">Matter</p>
          <p className="text-sm font-medium text-foreground">{caseTitle}</p>
          {caseNumber && (
            <p className="text-xs font-mono text-muted-foreground">{caseNumber}</p>
          )}
        </div>

        {/* Allegations */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Allegations / Facts of the Matter *
          </label>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            Describe what happened. Include all relevant facts, dates, parties involved, and what is being claimed or disputed.
          </p>
          <textarea
            value={allegations}
            onChange={(e) => setAllegations(e.target.value)}
            placeholder="e.g. On 15 March 2024, the applicant was dismissed by the respondent without a prior warning or a fair disciplinary hearing. The applicant had been employed for 7 years with no prior misconduct. The dismissal was carried out verbally and no written notice was provided..."
            rows={6}
            className="w-full bg-muted border rounded-xl px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed transition-all"
            style={{ borderColor: 'hsl(var(--border))' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = agent.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${agent.color}22`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {allegations.length} chars {allegations.length < 10 && '(minimum 10)'}
          </p>
        </div>

        {/* Defense summary */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Your Position / Defense Summary
          </label>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            Summarise your client's position, key arguments, or the defense strategy you intend to pursue.
          </p>
          <textarea
            value={defenseSummary}
            onChange={(e) => setDefenseSummary(e.target.value)}
            placeholder="e.g. We contend that the dismissal was both substantively and procedurally unfair under Section 188 of the LRA. The employer failed to follow the Code of Good Practice (Schedule 8) and had no valid reason for dismissal. We will argue reinstatement or maximum compensation..."
            rows={4}
            className="w-full bg-muted border rounded-xl px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed transition-all"
            style={{ borderColor: 'hsl(var(--border))' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = agent.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${agent.color}22`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Evidence section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Evidence Items ({evidence.length})
            </label>
            <button
              onClick={() => setShowEvidenceForm(true)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: agent.color, backgroundColor: `${agent.color}15` }}
            >
              <Plus className="w-3 h-3" />
              Add Evidence
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            List all evidence you have or plan to rely on. Include documents, witness statements, recordings, etc.
          </p>

          {/* Evidence list */}
          <div className="space-y-2">
            <AnimatePresence>
              {evidence.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-3"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {EVIDENCE_TYPE_LABELS[item.type]}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: item.side === 'defense' ? '#60a5fa20' : item.side === 'opposition' ? '#f8717120' : '#a78bfa20',
                          color: item.side === 'defense' ? '#60a5fa' : item.side === 'opposition' ? '#f87171' : '#a78bfa',
                        }}
                      >
                        {item.side}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEvidence(item.id)}
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {evidence.length === 0 && !showEvidenceForm && (
              <div
                className="border border-dashed border-border rounded-xl px-4 py-5 text-center cursor-pointer hover:border-opacity-60 transition-colors"
                onClick={() => setShowEvidenceForm(true)}
              >
                <FileText className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No evidence added. Click to add your first item.
                </p>
              </div>
            )}
          </div>

          {/* Add evidence inline form */}
          <AnimatePresence>
            {showEvidenceForm && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 bg-card border rounded-xl p-4 space-y-3"
                style={{ borderColor: `${agent.color}40` }}
              >
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">New Evidence Item</p>

                <input
                  type="text"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Evidence title (e.g. Termination Letter dated 15 March 2024)"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Type</label>
                    <select
                      value={newEvidence.type}
                      onChange={(e) => setNewEvidence((p) => ({ ...p, type: e.target.value as EvidenceType }))}
                      className="w-full bg-muted border border-border rounded-lg px-2 py-2 text-xs text-foreground focus:outline-none"
                    >
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t} value={t}>{EVIDENCE_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Side</label>
                    <select
                      value={newEvidence.side}
                      onChange={(e) => setNewEvidence((p) => ({ ...p, side: e.target.value as Side }))}
                      className="w-full bg-muted border border-border rounded-lg px-2 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="defense">Defense</option>
                      <option value="opposition">Opposition</option>
                      <option value="court">Neutral / Court</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of what this evidence shows and why it matters..."
                  rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={addEvidence}
                    disabled={!newEvidence.title.trim()}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ backgroundColor: agent.color, color: '#fff' }}
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setShowEvidenceForm(false)}
                    className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit */}
      <div className="flex-shrink-0 border-t border-border px-4 py-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            canSubmit
              ? 'text-white shadow-lg'
              : 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
          )}
          style={canSubmit ? { backgroundColor: agent.color, boxShadow: `0 4px 16px ${agent.color}40` } : {}}
        >
          Begin Session with {agent.name}
          <ArrowRight className="w-4 h-4" />
        </button>
        {!canSubmit && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Please describe the allegations to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default CaseBriefing;
