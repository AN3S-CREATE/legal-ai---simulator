import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Scale,
  Shield,
  Swords,
  Gavel,
  PieChart,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
  MessageSquareMore,
  ClipboardCopy,
  ClipboardCheck,
  Download,
  Check,
  Pencil,
} from 'lucide-react';
import { useStore } from '../store';
import { updateCase } from '../api';
import AgentChat from './AgentChat';
import CaseBriefing from './CaseBriefing';
import type { Briefing } from './CaseBriefing';
import StatusBadge from './StatusBadge';
import type { AgentRole, CaseStatus } from '../types';
import {
  AGENTS,
  STATUS_LABELS,
  STATUS_COLORS,
  CASE_TYPE_LABELS,
  CASE_TYPE_COLORS,
  SCENARIO_LABELS,
  SCENARIO_COLORS,
  SCENARIO_ICONS,
  PROBABILITY_LABELS,
  ADMISSIBILITY_COLORS,
} from '../types';

interface CaseDetailProps {
  caseId: string;
  onBack: () => void;
}

type TabId = 'overview' | 'evidence' | 'scenarios' | 'courtroom';

const CaseDetail: React.FC<CaseDetailProps> = ({ caseId, onBack }) => {
  const {
    cases, evidence, scenarios,
    evidenceLoading, scenariosLoading,
    loadEvidence, loadScenarios,
    newScenarioCount, resetNewScenarioCount,
  } = useStore();
  const caseRecord = cases.find((c) => c.id === caseId);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeAgent, setActiveAgent] = useState<AgentRole | null>(null);
  // Per-agent briefings: once submitted, the chat begins; reset clears it
  const [briefings, setBriefings] = useState<Partial<Record<AgentRole, Briefing>>>({});
  // Track which tabs the user has actively visited (overview = visited by default)
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set(['overview']));
  // Label shown when a scenario was used to pre-fill a briefing
  const [scenarioContextLabel, setScenarioContextLabel] = useState<string | null>(null);

  // Export / copy state: 'idle' | 'copied'
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  // ── Inline status editor ──────────────────────────────────────────────────
  const [statusOpen, setStatusOpen]   = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const statusPickerRef = useRef<HTMLDivElement>(null);
  const { patchCaseStatus } = useStore();

  // Close picker when clicking outside
  useEffect(() => {
    if (!statusOpen) return;
    const handler = (e: MouseEvent) => {
      if (statusPickerRef.current && !statusPickerRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  const handleStatusChange = useCallback(async (newStatus: CaseStatus) => {
    if (!caseRecord || newStatus === caseRecord.status) { setStatusOpen(false); return; }
    setStatusOpen(false);
    const prev = caseRecord.status;
    // Optimistic update
    patchCaseStatus(caseRecord.id, newStatus);
    setStatusSaving(true);
    try {
      await updateCase(caseRecord.id, { status: newStatus });
    } catch {
      // Rollback on failure
      patchCaseStatus(caseRecord.id, prev);
    } finally {
      setStatusSaving(false);
    }
  }, [caseRecord, patchCaseStatus]);

  // ── Inline presiding officer editor ──────────────────────────────────────
  const [officerEditing, setOfficerEditing] = useState(false);
  const [officerValue,   setOfficerValue]   = useState('');
  const [officerSaving,  setOfficerSaving]  = useState(false);
  const [officerSaved,   setOfficerSaved]   = useState(false);
  const officerInputRef = useRef<HTMLInputElement>(null);
  const { patchCaseField } = useStore();

  const openOfficerEditor = useCallback(() => {
    if (!caseRecord) return;
    setOfficerValue(caseRecord.presidingOfficer || '');
    setOfficerEditing(true);
    // Focus the input on the next paint
    setTimeout(() => officerInputRef.current?.focus(), 0);
  }, [caseRecord]);

  const handleOfficerSave = useCallback(async () => {
    if (!caseRecord) return;
    const trimmed = officerValue.trim();
    // Nothing changed — just close
    if (trimmed === (caseRecord.presidingOfficer || '').trim()) {
      setOfficerEditing(false);
      return;
    }
    setOfficerEditing(false);
    const prev = caseRecord.presidingOfficer;
    // Optimistic update
    patchCaseField(caseRecord.id, { presidingOfficer: trimmed });
    setOfficerSaving(true);
    try {
      await updateCase(caseRecord.id, { presidingOfficer: trimmed });
      setOfficerSaved(true);
      setTimeout(() => setOfficerSaved(false), 2000);
    } catch {
      // Rollback
      patchCaseField(caseRecord.id, { presidingOfficer: prev });
    } finally {
      setOfficerSaving(false);
    }
  }, [caseRecord, officerValue, patchCaseField]);

  const handleOfficerKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); handleOfficerSave(); }
    if (e.key === 'Escape') { setOfficerEditing(false); }
  }, [handleOfficerSave]);

  /** Build the plain-text case summary block */
  const buildExport = (): string => {
    if (!caseRecord) return '';
    const hr  = '─'.repeat(60);
    const hr2 = '═'.repeat(60);
    const ts  = new Date().toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const field = (label: string, value?: string) =>
      `  ${label.padEnd(22)} ${value || '—'}`;

    // Bug 5 fix: filter store arrays to only items for this case
    const caseEvidence  = evidence.filter((e) => e.caseReference === caseRecord.caseNumber);
    const caseScenarios = scenarios.filter((s) => s.caseReference === caseRecord.caseNumber);

    // Evidence breakdown by admissibility
    const admCounts: Record<string, number> = {};
    caseEvidence.forEach((e) => {
      admCounts[e.admissibility] = (admCounts[e.admissibility] || 0) + 1;
    });
    const admLines = Object.entries(admCounts)
      .map(([k, v]) => `    • ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
      .join('\n') || '    (none loaded)';

    // Scenario breakdown by type
    const scnCounts: Record<string, number> = {};
    caseScenarios.forEach((s) => {
      const label = SCENARIO_LABELS[s.scenarioType] ?? s.scenarioType;
      scnCounts[label] = (scnCounts[label] || 0) + 1;
    });
    const scnLines = Object.entries(scnCounts)
      .map(([k, v]) => `    • ${k}: ${v}`)
      .join('\n') || '    (none loaded)';

    return [
      hr2,
      `  VERALOGIX — CASE SUMMARY EXPORT`,
      `  Generated: ${ts}`,
      hr2,
      '',
      `  MATTER`,
      hr,
      field('Title:', caseRecord.title),
      field('Case Number:', caseRecord.caseNumber),
      field('Type:', CASE_TYPE_LABELS[caseRecord.caseType]),
      field('Status:', STATUS_LABELS[caseRecord.status]),
      '',
      `  PARTIES & TRIBUNAL`,
      hr,
      field('Parties:', caseRecord.parties),
      field('Court / Tribunal:', caseRecord.court),
      field('Presiding Officer:', caseRecord.presidingOfficer),
      '',
      `  LEGAL SUBSTANCE`,
      hr,
      `  Key Claims:`,
      ...(caseRecord.keyClaims
        ? caseRecord.keyClaims.split(/\n+/).map((l) => `    ${l}`)
        : ['    —']),
      '',
      `  Key Defenses:`,
      ...(caseRecord.keyDefenses
        ? caseRecord.keyDefenses.split(/\n+/).map((l) => `    ${l}`)
        : ['    —']),
      '',
      `  EVIDENCE  (${caseEvidence.length} item${caseEvidence.length !== 1 ? 's' : ''})`,
      hr,
      admLines,
      '',
      `  SCENARIO BRANCHES  (${caseScenarios.length} branch${caseScenarios.length !== 1 ? 'es' : ''})`,
      hr,
      scnLines,
      '',
      hr2,
      `  SIMULATION NOTICE`,
      `  This export is for preparation purposes only. All outputs are`,
      `  simulated. Nothing herein constitutes legal advice.`,
      hr2,
    ].join('\n');
  };

  /** Drill into a scenario: derives agent role, pre-fills briefing, opens courtroom */
  const drillIntoScenario = (scenario: typeof scenarios[number]) => {
    // Derive role from title prefix "[Agent Name] ..."
    let role: AgentRole = 'analyst';
    const titleLower = scenario.title.toLowerCase();
    if (titleLower.includes('defense counsel')) role = 'defense';
    else if (titleLower.includes('opposition counsel')) role = 'opposition';
    else if (titleLower.includes('presiding judge')) role = 'judge';
    else if (titleLower.includes('scenario analyst')) role = 'analyst';

    // Build a pre-filled briefing from the scenario
    const preFilled: Briefing = {
      allegations: scenario.summary || scenario.title,
      defenseSummary: scenario.keyFactors || '',
      evidence: [],
    };

    setBriefings((prev) => ({ ...prev, [role]: preFilled }));
    setActiveAgent(role);
    setScenarioContextLabel(scenario.title);
    setActiveTab('courtroom');
  };

  // Bug 8 fix: prefer caseNumber but fall back to node id so we always have a truthy ref
  const caseRef = (caseRecord?.caseNumber || caseRecord?.id || '').trim();

  useEffect(() => {
    if (caseRef) {
      loadEvidence(caseRef);
      loadScenarios(caseRef);
    }
  }, [caseRef, loadEvidence, loadScenarios]);

  if (!caseRecord) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Case not found.</p>
      </div>
    );
  }

  const typeColor = CASE_TYPE_COLORS[caseRecord.caseType];
  const statusColor = STATUS_COLORS[caseRecord.status];

  const selectedAgent = activeAgent ? AGENTS.find((a) => a.role === activeAgent) : null;

  const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'evidence', label: 'Evidence', icon: Scale },
    { id: 'scenarios', label: 'Scenarios', icon: BarChart3 },
    { id: 'courtroom', label: 'Courtroom', icon: Gavel },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="vx-glass flex-shrink-0 px-6 pt-5 pb-4 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(163,230,53,0.12)' }}>
        {/* Lime top-edge scan accent */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to right, transparent 0%, #a3e63500 10%, #a3e635cc 40%, #a3e635ff 50%, #a3e635cc 60%, #a3e63500 90%, transparent 100%)',
            boxShadow: '0 0 10px 1px #a3e63540',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4"
          style={{ letterSpacing: '0.1em' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Matters
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge label={CASE_TYPE_LABELS[caseRecord.caseType]} color={typeColor} size="sm" />

              {/* ── Inline status picker ── */}
              <div ref={statusPickerRef} className="relative">
                {/* Trigger — looks like StatusBadge but clickable */}
                <button
                  onClick={() => setStatusOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-all focus:outline-none"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    border: `1px solid ${statusOpen ? statusColor : `${statusColor}40`}`,
                    boxShadow: statusOpen ? `0 0 0 3px ${statusColor}20` : 'none',
                  }}
                  title="Click to change status"
                >
                  {/* Status dot */}
                  {statusSaving ? (
                    <Loader2 className="w-1.5 h-1.5 animate-spin flex-shrink-0" style={{ color: statusColor }} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                  )}
                  {STATUS_LABELS[caseRecord.status]}
                  <ChevronDown
                    className="w-2.5 h-2.5 flex-shrink-0 transition-transform duration-150"
                    style={{ transform: statusOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: statusColor }}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {statusOpen && (
                    <motion.div
                      key="status-dropdown"
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="absolute left-0 top-full mt-1.5 z-50 min-w-[140px] rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(18,18,18,0.96)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
                      }}
                    >
                      <div className="py-1">
                        {(Object.keys(STATUS_LABELS) as CaseStatus[]).map((s) => {
                          const sColor   = STATUS_COLORS[s];
                          const isCurrent = s === caseRecord.status;
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left"
                              style={{
                                color: isCurrent ? sColor : '#9ca3af',
                                backgroundColor: isCurrent ? `${sColor}12` : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (!isCurrent) e.currentTarget.style.backgroundColor = `${sColor}0e`;
                                e.currentTarget.style.color = sColor;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isCurrent ? `${sColor}12` : 'transparent';
                                e.currentTarget.style.color = isCurrent ? sColor : '#9ca3af';
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: sColor }}
                              />
                              <span className="flex-1">{STATUS_LABELS[s]}</span>
                              {isCurrent && (
                                <Check className="w-3 h-3 flex-shrink-0" style={{ color: sColor }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {caseRecord.caseNumber && (
                <span className="text-xs font-mono text-muted-foreground">
                  {caseRecord.caseNumber}
                </span>
              )}
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground truncate">{caseRecord.title}</h1>
            {caseRecord.court && (
              <p className="vx-eyebrow mt-1" style={{ fontSize: '0.6rem' }}>{caseRecord.court}</p>
            )}
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex items-center gap-1.5 mt-4">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isScenarios  = id === 'scenarios';
            const isCourtroom  = id === 'courtroom';
            const noBriefings  = Object.keys(briefings).length === 0;
            const showBadge    = isScenarios && newScenarioCount > 0 && activeTab !== 'scenarios';
            const showPulse    = isCourtroom && noBriefings && activeTab !== 'courtroom';
            const isActive     = activeTab === id;
            const wasVisited   = visitedTabs.has(id);
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setVisitedTabs((prev) => new Set([...prev, id]));
                  if (isScenarios) {
                    resetNewScenarioCount();
                    loadScenarios(caseRef);
                  }
                }}
                className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                style={{
                  letterSpacing: '0.08em',
                  backgroundColor: isActive ? '#a3e635' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#111' : wasVisited ? '#d4d4d4' : '#6b7280',
                  border: isActive ? '1px solid #a3e635' : wasVisited ? '1px solid rgba(163,230,53,0.2)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 12px #a3e63440' : 'none',
                }}
              >
                {/* Tiny visited dot on unactive visited tabs */}
                {wasVisited && !isActive && (
                  <span
                    className="absolute top-0.5 right-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#a3e635', boxShadow: '0 0 4px #a3e635' }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                {label}

                {/* Scenario count badge */}
                <AnimatePresence>
                  {showBadge && (
                    <motion.span
                      key="scenario-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: '#a3e635', color: '#111', boxShadow: '0 0 8px #a3e63580' }}
                    >
                      {newScenarioCount}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Courtroom onboarding pulse dot */}
                <AnimatePresence>
                  {showPulse && (
                    <motion.span
                      key="courtroom-pulse"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1"
                    >
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: '#a3e63540' }}
                      />
                      <span
                        className="relative block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#a3e635', boxShadow: '0 0 6px #a3e635aa' }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* ── Case Completeness Progress Bar ── */}
        {(() => {
          const visited    = visitedTabs.size;
          const total      = tabs.length;
          const pct        = (visited / total) * 100;
          const isComplete = visited === total;
          return (
            <div className="mt-3 flex items-center gap-3">
              {/* Track */}
              <div
                className="flex-1 relative h-[3px] rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                {/* Filled bar */}
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background: isComplete
                      ? 'linear-gradient(90deg, #a3e635, #d9f99d)'
                      : '#a3e635',
                    boxShadow: isComplete ? '0 0 8px #a3e63588' : '0 0 6px #a3e63555',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Segment tick marks */}
                {[25, 50, 75].map((pos) => (
                  <div
                    key={pos}
                    className="absolute top-0 h-full w-px"
                    style={{
                      left: `${pos}%`,
                      backgroundColor: 'rgba(0,0,0,0.35)',
                    }}
                  />
                ))}
              </div>

              {/* Fraction + label */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="text-[10px] font-black tabular-nums leading-none"
                  style={{ color: isComplete ? '#a3e635' : '#6b7280' }}
                >
                  {visited}<span className="opacity-40">/{total}</span>
                </span>
                <AnimatePresence mode="wait">
                  {isComplete && (
                    <motion.span
                      key="complete"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: '#a3e63520',
                        color: '#a3e635',
                        border: '1px solid #a3e63540',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Complete
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })()}

        {/* Hint text */}
        {(() => {
          const visited = visitedTabs.size;
          const messages: Record<number, string> = {
            1: 'Visit Evidence, Scenarios & Courtroom to explore the full case',
            2: '2 of 4 sections reviewed — keep exploring',
            3: 'Almost complete — one section remaining',
            4: 'All sections reviewed · Case fully explored',
          };
          return (
            <motion.p
              key={visited}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-[10px] mt-1.5"
              style={{ color: visitedTabs.size === 4 ? '#a3e63580' : '#4b5563' }}
            >
              {messages[visited]}
            </motion.p>
          );
        })()}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main content */}
        <div className={`flex-1 overflow-y-auto p-6 ${activeAgent ? 'hidden xl:block xl:min-w-0' : ''}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Disclaimer */}
                <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: '#a3e63510', border: '1px solid #a3e63530' }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#a3e635' }} />
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: '#a3e635' }}>Simulation Notice</p>
                    <p className="text-xs" style={{ color: '#a3e63599' }}>
                      This is a preparation and simulation system. All actor outputs are simulated. Nothing here constitutes legal advice.
                    </p>
                  </div>
                </div>

                {/* Core case details */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-4">Case Record</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Parties" value={caseRecord.parties} />
                    <InfoRow label="Court / Tribunal" value={caseRecord.court} />

                    {/* ── Inline presiding officer editor ── */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Presiding Officer</p>
                      <AnimatePresence mode="wait" initial={false}>
                        {officerEditing ? (
                          /* ── Input mode ── */
                          <motion.div
                            key="officer-input"
                            initial={{ opacity: 0, y: -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.12 }}
                            className="flex items-center gap-1.5"
                          >
                            <input
                              ref={officerInputRef}
                              value={officerValue}
                              onChange={(e) => setOfficerValue(e.target.value)}
                              onKeyDown={handleOfficerKeyDown}
                              onBlur={handleOfficerSave}
                              maxLength={120}
                              placeholder="Judge / Commissioner"
                              className="flex-1 min-w-0 bg-muted border rounded-lg px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all"
                              style={{ borderColor: '#a3e63560', boxShadow: '0 0 0 3px #a3e63518' }}
                            />
                            <button
                              onMouseDown={(e) => { e.preventDefault(); handleOfficerSave(); }}
                              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#a3e63520', color: '#a3e635' }}
                              title="Save (Enter)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ) : (
                          /* ── Display mode ── */
                          <motion.div
                            key="officer-display"
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 3 }}
                            transition={{ duration: 0.12 }}
                            className="group flex items-center gap-2 cursor-pointer"
                            onClick={openOfficerEditor}
                            title="Click to edit"
                          >
                            <p className={`text-sm transition-colors ${
                              caseRecord.presidingOfficer && caseRecord.presidingOfficer !== 'TBD'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50 italic'
                            } group-hover:text-primary`}>
                              {caseRecord.presidingOfficer && caseRecord.presidingOfficer !== 'TBD'
                                ? caseRecord.presidingOfficer
                                : 'Not assigned'}
                            </p>

                            {/* Saving spinner / Saved flash / Edit pencil */}
                            {officerSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: '#6b7280' }} />
                            ) : officerSaved ? (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1 text-[10px] font-medium"
                                style={{ color: '#a3e635' }}
                              >
                                <Check className="w-2.5 h-2.5" />
                                Saved
                              </motion.span>
                            ) : (
                              <Pencil
                                className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                                style={{ color: '#a3e635' }}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Status row — live-reflects optimistic updates */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={STATUS_LABELS[caseRecord.status]}
                          color={STATUS_COLORS[caseRecord.status]}
                          size="sm"
                        />
                        {statusSaving && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#6b7280' }}>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Saving…
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claims & Defenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-blue-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <h3 className="font-semibold text-sm text-foreground">Key Claims</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {caseRecord.keyClaims || 'No claims recorded.'}
                    </p>
                  </div>
                  <div className="bg-card border border-red-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Swords className="w-4 h-4 text-red-400" />
                      <h3 className="font-semibold text-sm text-foreground">Key Defenses</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {caseRecord.keyDefenses || 'No defenses recorded.'}
                    </p>
                  </div>
                </div>

                {/* ── Export Summary card ── */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(163,230,53,0.18)', backgroundColor: 'rgba(163,230,53,0.04)' }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ borderBottom: '1px solid rgba(163,230,53,0.12)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" style={{ color: '#a3e635' }} />
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a3e635', letterSpacing: '0.1em' }}>
                        Case Summary Export
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Download as .txt */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const text = buildExport();
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url  = URL.createObjectURL(blob);
                          const a    = document.createElement('a');
                          a.href     = url;
                          a.download = `${caseRecord.caseNumber || 'case'}-summary.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#9ca3af',
                        }}
                        title="Download as .txt"
                      >
                        <Download className="w-3 h-3" />
                        .txt
                      </motion.button>

                      {/* Copy to clipboard */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(buildExport());
                            setCopyState('copied');
                            setTimeout(() => setCopyState('idle'), 2200);
                          } catch {
                            // fallback: select a textarea
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: copyState === 'copied' ? '#a3e63520' : 'rgba(163,230,53,0.12)',
                          border: `1px solid ${copyState === 'copied' ? '#a3e635' : 'rgba(163,230,53,0.35)'}`,
                          color: copyState === 'copied' ? '#a3e635' : '#a3e635',
                          boxShadow: copyState === 'copied' ? '0 0 10px #a3e63530' : 'none',
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {copyState === 'copied' ? (
                            <motion.span
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                              className="flex items-center gap-1.5"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              Copied!
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                              className="flex items-center gap-1.5"
                            >
                              <ClipboardCopy className="w-3 h-3" />
                              Copy
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>

                  {/* Preview pane */}
                  <pre
                    className="px-5 py-4 text-[10px] leading-relaxed overflow-x-auto"
                    style={{
                      fontFamily: '"Geist Mono", "JetBrains Mono", "Fira Code", ui-monospace, monospace',
                      color: '#6b7280',
                      whiteSpace: 'pre',
                      maxHeight: '14rem',
                      overflowY: 'auto',
                    }}
                  >
                    {buildExport()}
                  </pre>
                </div>

                {/* AI Actors */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Legal AI Actors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {AGENTS.map((agent) => (
                      <motion.button
                        key={agent.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveAgent(agent.role);
                          setActiveTab('courtroom');
                        }}
                        className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 text-left hover:border-opacity-60 transition-all group"
                        style={{ '--agent-color': agent.color } as React.CSSProperties}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${agent.color}20`, border: `1px solid ${agent.color}30` }}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {agent.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 flex-shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-foreground">
                    Evidence ({evidence.length})
                  </h3>
                </div>

                {evidenceLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : evidence.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No evidence items for this matter.
                  </div>
                ) : (
                  evidence.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <StatusBadge
                              label={item.admissibility}
                              color={ADMISSIBILITY_COLORS[item.admissibility]}
                              size="sm"
                            />
                            <StatusBadge
                              label={item.side}
                              color={item.side === 'defense' ? '#60a5fa' : item.side === 'opposition' ? '#f87171' : '#a78bfa'}
                              size="sm"
                            />
                          </div>
                          <p className="font-medium text-sm text-foreground">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex-shrink-0">
                          {item.evidenceType}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'scenarios' && (
              <motion.div
                key="scenarios"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-foreground">
                    Scenario Branches ({scenarios.length})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveAgent('analyst');
                      setActiveTab('courtroom');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80"
                    style={{ color: '#a3e635', backgroundColor: '#a3e63514', border: '1px solid #a3e63530' }}
                  >
                    <PieChart className="w-3 h-3" />
                    Ask Scenario Analyst
                  </button>
                </div>

                {scenariosLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : scenarios.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No scenario branches for this matter yet.
                    <br />
                    Ask the Scenario Analyst to generate them.
                  </div>
                ) : (
                  scenarios.map((s, i) => {
                    const sColor = SCENARIO_COLORS[s.scenarioType];
                    // Derive agent config for the drill-in button label
                    const titleLower = s.title.toLowerCase();
                    let drillAgent = AGENTS.find((a) => a.role === 'analyst')!;
                    if (titleLower.includes('defense counsel')) drillAgent = AGENTS.find((a) => a.role === 'defense')!;
                    else if (titleLower.includes('opposition counsel')) drillAgent = AGENTS.find((a) => a.role === 'opposition')!;
                    else if (titleLower.includes('presiding judge')) drillAgent = AGENTS.find((a) => a.role === 'judge')!;

                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-xl p-4 relative overflow-hidden group"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                          style={{ backgroundColor: sColor }}
                        />
                        <div className="pl-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base">{SCENARIO_ICONS[s.scenarioType]}</span>
                              <StatusBadge
                                label={SCENARIO_LABELS[s.scenarioType]}
                                color={sColor}
                                size="sm"
                              />
                              <StatusBadge
                                label={PROBABILITY_LABELS[s.probability]}
                                color={s.probability === 'high' ? '#a3e635' : s.probability === 'medium' ? '#60a5fa' : '#f87171'}
                                size="sm"
                              />
                            </div>

                            {/* Drill In button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => drillIntoScenario(s)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
                              style={{
                                backgroundColor: `${drillAgent.color}18`,
                                border: `1px solid ${drillAgent.color}35`,
                                color: drillAgent.color,
                              }}
                              title={`Open in Courtroom with ${drillAgent.name}`}
                            >
                              <MessageSquareMore className="w-3 h-3" />
                              <span className="hidden sm:inline">Drill In</span>
                              <span
                                className="text-[10px] opacity-70 hidden sm:inline"
                              >
                                · {drillAgent.icon}
                              </span>
                            </motion.button>
                          </div>

                          <p className="font-medium text-sm text-foreground mb-1">{s.title}</p>
                          {s.summary && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{s.summary}</p>
                          )}
                          {s.keyFactors && (
                            <div className="bg-muted rounded-lg px-3 py-2">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/70">Key factors: </span>
                                {s.keyFactors}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === 'courtroom' && !selectedAgent && (
              <motion.div
                key="courtroom-select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-muted-foreground mb-5">
                  Select a legal AI actor to begin the simulation:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AGENTS.map((agent) => (
                    <motion.button
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveAgent(agent.role)}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-opacity-60 transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${agent.color}20`, border: `1px solid ${agent.color}30` }}
                      >
                        {agent.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent panel — briefing first, then chat */}
        <AnimatePresence>
          {selectedAgent && activeTab === 'courtroom' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'clamp(360px, 32vw, 500px)', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 border-l border-border overflow-hidden"
              style={{ width: 'clamp(360px, 32vw, 500px)' }}
            >
              <div className="h-full flex flex-col">
                {/* Agent switcher */}
                <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-border">
                  <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setActiveAgent(a.role);
                          setScenarioContextLabel(null);
                        }}
                        title={a.name}
                        className={`flex-1 text-sm py-1.5 px-2 rounded-lg transition-all ${
                          activeAgent === a.role
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {a.icon}
                      </button>
                    ))}
                    {/* Reset briefing for current agent */}
                    {activeAgent && briefings[activeAgent] && (
                      <button
                        onClick={() => {
                          if (!activeAgent) return;
                          setBriefings((prev) => {
                            const next = { ...prev };
                            delete next[activeAgent];
                            return next;
                          });
                          setScenarioContextLabel(null);
                        }}
                        title="Re-submit briefing"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveAgent(null);
                        setScenarioContextLabel(null);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Close panel"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario context banner */}
                <AnimatePresence>
                  {scenarioContextLabel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 overflow-hidden"
                    >
                      <div
                        className="mx-3 mb-2 flex items-start gap-2 px-3 py-2 rounded-lg"
                        style={{ backgroundColor: '#a3e63510', border: '1px solid #a3e63530' }}
                      >
                        <MessageSquareMore className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#a3e635' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#a3e635' }}>
                            Scenario Context Pre-filled
                          </p>
                          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#a3e63599' }}>
                            {scenarioContextLabel}
                          </p>
                        </div>
                        <button
                          onClick={() => setScenarioContextLabel(null)}
                          className="flex-shrink-0 text-xs leading-none transition-opacity opacity-50 hover:opacity-100"
                          style={{ color: '#a3e635' }}
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Briefing form or Chat */}
                <div className="flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    {briefings[selectedAgent.role] ? (
                      <motion.div
                        key={`chat-${selectedAgent.role}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full px-3 pb-3 pt-2"
                      >
                        <AgentChat
                          key={`${selectedAgent.id}-${caseId}-${briefings[selectedAgent.role] ? 'briefed' : 'empty'}`}
                          agent={selectedAgent}
                          embedded
                          initialContext={briefings[selectedAgent.role]}
                          caseRef={caseRecord.caseNumber}
                          caseTitle={caseRecord.title}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`briefing-${selectedAgent.role}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <CaseBriefing
                          agent={selectedAgent}
                          caseTitle={caseRecord.title}
                          caseNumber={caseRecord.caseNumber}
                          onSubmit={(briefing) => {
                            setBriefings((prev) => ({
                              ...prev,
                              [selectedAgent.role]: briefing,
                            }));
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value || '—'}</p>
    </div>
  );
}

export default CaseDetail;
