import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createCase } from '../api';
import type { CaseStatus, CaseType } from '../types';
import { CASE_TYPE_LABELS, STATUS_LABELS } from '../types';

interface NewCaseModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const NewCaseModal: React.FC<NewCaseModalProps> = ({ onClose, onCreated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    caseNumber: '',
    parties: '',
    court: '',
    status: 'prep' as CaseStatus,
    caseType: 'civil' as CaseType,
    presidingOfficer: '',
    keyClaims: '',
    keyDefenses: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createCase(form);
      setSaving(false);
      onCreated();
    } catch {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <p className="vx-eyebrow mb-0.5" style={{ fontSize: '0.6rem' }}>New Legal Matter</p>
              <h2 className="font-black text-foreground tracking-tight">Create Matter</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {field('Matter Title *', 'title', 'text', 'e.g. Smith v. Acme Mining (Pty) Ltd')}
              
              <div className="grid grid-cols-2 gap-3">
                {field('Case Number', 'caseNumber', 'text', '2025/00001')}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Case Type</label>
                  <select
                    value={form.caseType}
                    onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value as CaseType }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {(Object.keys(CASE_TYPE_LABELS) as CaseType[]).map((k) => (
                      <option key={k} value={k}>{CASE_TYPE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {field('Parties', 'parties', 'text', 'Applicant vs. Respondent')}
              {field('Court / Tribunal', 'court', 'text', 'e.g. Labour Court, Johannesburg')}

              <div className="grid grid-cols-2 gap-3">
                {field('Presiding Officer', 'presidingOfficer', 'text', 'Judge / Commissioner')}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CaseStatus }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {(Object.keys(STATUS_LABELS) as CaseStatus[]).map((k) => (
                      <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Key Claims</label>
                <textarea
                  value={form.keyClaims}
                  onChange={(e) => setForm((f) => ({ ...f, keyClaims: e.target.value }))}
                  placeholder="Summarise the applicant's key claims..."
                  rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Key Defenses</label>
                <textarea
                  value={form.keyDefenses}
                  onChange={(e) => setForm((f) => ({ ...f, keyDefenses: e.target.value }))}
                  placeholder="Summarise the respondent's key defenses..."
                  rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="vx-btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || saving}
                className="vx-btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {saving ? 'Creating…' : 'Create Matter →'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewCaseModal;
