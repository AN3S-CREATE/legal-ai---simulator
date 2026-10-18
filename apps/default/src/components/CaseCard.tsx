import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Calendar, User, ArrowRight, Users } from 'lucide-react';
import type { CaseRecord } from '../types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CASE_TYPE_LABELS,
  CASE_TYPE_COLORS,
} from '../types';
import StatusBadge from './StatusBadge';

interface CaseCardProps {
  caseRecord: CaseRecord;
  onClick: () => void;
  index: number;
  /** If set, matched substrings are highlighted with a lime mark */
  searchQuery?: string;
}

/** Renders `text` with the first occurrence of `query` wrapped in a lime <mark>. */
function Hl({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const lower = text.toLowerCase();
  const idx   = lower.indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        className="rounded-sm px-0.5 not-italic"
        style={{
          backgroundColor: 'rgba(163,230,53,0.22)',
          color: '#a3e635',
          fontWeight: 700,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const CaseCard: React.FC<CaseCardProps> = ({ caseRecord, onClick, index, searchQuery = '' }) => {
  const statusColor = STATUS_COLORS[caseRecord.status];
  const typeColor   = CASE_TYPE_COLORS[caseRecord.caseType];
  const q = searchQuery.trim().toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl p-5 transition-all duration-300 relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
      }}
      whileHover={{
        borderColor: '#a3e63540',
        boxShadow: '0 4px 32px rgba(163,230,53,0.08)',
      }}
    >
      {/* Coloured top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ backgroundColor: typeColor, opacity: 0.7 }}
      />

      {/* Badges + arrow row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge label={CASE_TYPE_LABELS[caseRecord.caseType]} color={typeColor} size="sm" />
          <StatusBadge label={STATUS_LABELS[caseRecord.status]} color={statusColor} size="sm" />
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 flex-shrink-0"
          style={{
            backgroundColor: 'rgba(163,230,53,0.12)',
            border: '1px solid rgba(163,230,53,0.25)',
          }}
        >
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
            style={{ color: '#a3e635' }}
          />
        </div>
      </div>

      {/* Case title — highlighted when searching */}
      <h3 className="font-black text-foreground text-base mb-0.5 leading-tight tracking-tight">
        <Hl text={caseRecord.title} query={q} />
      </h3>

      {/* Case number — highlighted */}
      <p className="text-xs font-mono mb-3 tracking-wider" style={{ color: q && caseRecord.caseNumber?.toLowerCase().includes(q) ? '#a3e635' : '#6b7280' }}>
        {caseRecord.caseNumber ? <Hl text={caseRecord.caseNumber} query={q} /> : '—'}
      </p>

      {/* Meta rows */}
      <div className="space-y-1.5">
        {caseRecord.court && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Scale className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              <Hl text={caseRecord.court} query={q} />
            </span>
          </div>
        )}
        {caseRecord.parties && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              <Hl text={caseRecord.parties} query={q} />
            </span>
          </div>
        )}
        {caseRecord.presidingOfficer && caseRecord.presidingOfficer !== 'TBD' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{caseRecord.presidingOfficer}</span>
          </div>
        )}
        {caseRecord.nextHearing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Next hearing scheduled</span>
          </div>
        )}
      </div>

      {/* Search match glow — extra lime aura when a query matches */}
      {q && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(163,230,53,0.06), transparent 65%)',
          }}
        />
      )}

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${typeColor}0a, transparent 55%)` }}
      />
    </motion.div>
  );
};

export default CaseCard;
