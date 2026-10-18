import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Plus,
  Loader2,
  FolderOpen,
  BarChart3,
  Gavel,
  BookOpen,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store';
import CaseCard from './CaseCard';
import NewCaseModal from './NewCaseModal';
import type { CaseStatus } from '../types';
import { STATUS_LABELS } from '../types';

interface DashboardProps {
  onSelectCase: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectCase }) => {
  const { cases, casesLoading, loadCases } = useStore();
  const [showNewCase, setShowNewCase] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // ── Filter + search logic ─────────────────────────────────────────────────
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = useCallback(
    (c: (typeof cases)[number]) => {
      if (!trimmedQuery) return true;
      return (
        (c.title?.toLowerCase().includes(trimmedQuery)) ||
        (c.caseNumber?.toLowerCase().includes(trimmedQuery)) ||
        (c.parties?.toLowerCase().includes(trimmedQuery)) ||
        (c.court?.toLowerCase().includes(trimmedQuery))
      );
    },
    [trimmedQuery]
  );

  const filtered = cases.filter(
    (c) => (filterStatus === 'all' || c.status === filterStatus) && matchesSearch(c)
  );

  // Stats always off the full list
  const activeCount = cases.filter((c) => c.status === 'active').length;
  const prepCount   = cases.filter((c) => c.status === 'prep').length;

  const statuses: Array<CaseStatus | 'all'> = ['all', 'active', 'prep', 'settled', 'closed'];
  const hasSearch = trimmedQuery.length > 0;

  // ⌘K / Ctrl+K focuses the search bar; Escape clears & blurs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearchQuery('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Glass header ── */}
      <div className="vx-glass flex-shrink-0 px-6 pt-6 pb-4 relative overflow-hidden">
        {/* Lime top-edge pulse */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, transparent 5%, #a3e635cc 40%, #a3e635ff 50%, #a3e635cc 60%, transparent 95%)',
            boxShadow: '0 0 14px 1px #a3e63560',
          }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Radial bloom */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-72 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #a3e63514 0%, transparent 70%)' }}
        />

        {/* Title row */}
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <p className="vx-eyebrow mb-1">Matter Workspace</p>
            <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">
              Legal Matters
            </h1>
            <p className="text-sm text-muted-foreground mt-1">SA Legal Simulation Platform</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewCase(true)}
            className="vx-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            New Matter
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Stat counters */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { icon: Scale,     label: 'Total Matters', value: `${cases.length}`,                                color: '#a3e635' },
            { icon: Gavel,     label: 'Active',         value: `${activeCount}`,                               color: '#a3e635' },
            { icon: BookOpen,  label: 'Preparation',    value: `${prepCount}`,                                 color: '#60a5fa' },
            { icon: BarChart3, label: 'Case Types',     value: `${new Set(cases.map((c) => c.caseType)).size}`, color: '#a78bfa' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ backgroundColor: color }} />
              <div className="flex items-center gap-1.5 mb-2 pl-2">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
              </div>
              <p className="vx-stat-number pl-2">{value}</p>
              <p className="vx-stat-label pl-2">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter row ── */}
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            {/* Search icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Search
                className="w-3.5 h-3.5 transition-colors duration-200"
                style={{ color: searchFocused ? '#a3e635' : '#4b5563' }}
              />
            </div>

            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search matters — title, case number, parties, court…"
              className="w-full pl-9 pr-28 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all duration-200"
              style={{
                background: searchFocused ? 'rgba(163,230,53,0.05)' : 'rgba(255,255,255,0.05)',
                border: searchFocused
                  ? '1px solid rgba(163,230,53,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: searchFocused
                  ? '0 0 0 3px rgba(163,230,53,0.10), 0 2px 12px rgba(0,0,0,0.3)'
                  : '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />

            {/* Right decorations */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {/* Result count pill */}
              <AnimatePresence>
                {hasSearch && (
                  <motion.span
                    key="count"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: filtered.length > 0 ? '#a3e63520' : 'rgba(239,68,68,0.15)',
                      color: filtered.length > 0 ? '#a3e635' : '#f87171',
                      border: `1px solid ${filtered.length > 0 ? '#a3e63440' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Clear button */}
              <AnimatePresence>
                {hasSearch && (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    onClick={clearSearch}
                    className="p-0.5 rounded-md transition-colors hover:bg-white/10"
                    title="Clear search (Esc)"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* ⌘K hint */}
              <AnimatePresence>
                {!hasSearch && !searchFocused && (
                  <motion.div
                    key="kbd"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden sm:flex items-center gap-0.5 select-none"
                  >
                    {['⌘', 'K'].map((k) => (
                      <kbd
                        key={k}
                        className="text-[10px] text-muted-foreground/35 font-mono px-1 py-0.5 rounded"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <SlidersHorizontal className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
            {statuses.map((s) => {
              const isActive = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all"
                  style={{
                    letterSpacing: '0.08em',
                    backgroundColor: isActive ? '#a3e635' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#111' : '#6b7280',
                    border: isActive ? '1px solid #a3e635' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 12px #a3e63440' : 'none',
                  }}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active query label */}
        <AnimatePresence>
          {hasSearch && (
            <motion.p
              key="label"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18 }}
              className="text-xs overflow-hidden"
              style={{ color: '#a3e63555' }}
            >
              Searching{' '}
              <span style={{ color: '#a3e63580' }}>title · case number · parties · court</span>{' '}
              for{' '}
              <span className="font-semibold" style={{ color: '#a3e635' }}>
                &quot;{trimmedQuery}&quot;
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Case grid ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
        {casesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {hasSearch ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(163,230,53,0.06)',
                    border: '1px solid rgba(163,230,53,0.15)',
                  }}
                >
                  <Search className="w-6 h-6" style={{ color: '#a3e63550' }} />
                </div>
                <p className="font-semibold text-foreground mb-1">No matches found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Nothing matched{' '}
                  <span className="font-medium" style={{ color: '#a3e635' }}>
                    &quot;{trimmedQuery}&quot;
                  </span>
                  {filterStatus !== 'all' && (
                    <>
                      {' '}with status{' '}
                      <span className="font-medium">{STATUS_LABELS[filterStatus as CaseStatus]}</span>
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearSearch}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: '#a3e63515',
                      border: '1px solid #a3e63530',
                      color: '#a3e635',
                    }}
                  >
                    Clear search
                  </button>
                  {filterStatus !== 'all' && (
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#9ca3af',
                      }}
                    >
                      Show all statuses
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  {filterStatus === 'all'
                    ? 'No matters found. Create your first matter.'
                    : `No ${STATUS_LABELS[filterStatus as CaseStatus]} matters.`}
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.15) }}
                >
                  <CaseCard
                    caseRecord={c}
                    index={i}
                    searchQuery={trimmedQuery}
                    onClick={() => {
                      useStore.getState().setActiveCase(c.id);
                      onSelectCase(c.id);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Case Modal */}
      {showNewCase && (
        <NewCaseModal
          onClose={() => setShowNewCase(false)}
          onCreated={() => {
            setShowNewCase(false);
            loadCases();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
