// GeoLogix Legal AI — TypeScript Types

export type CaseStatus = 'active' | 'prep' | 'settled' | 'closed';
export type CaseType = 'civil' | 'labour' | 'commercial' | 'property' | 'family' | 'criminal';
export type EvidenceType = 'doc' | 'witness' | 'photo' | 'audio' | 'expert' | 'digital';
export type Admissibility = 'admitted' | 'challenged' | 'excluded' | 'pending';
export type Side = 'defense' | 'opposition' | 'court';
export type Confidence = 'high' | 'medium' | 'low';
export type ScenarioType = 'best' | 'likely' | 'worst' | 'settle' | 'collapse';
export type Probability = 'high' | 'medium' | 'low';

export type AgentRole = 'defense' | 'opposition' | 'judge' | 'analyst';

export interface CaseRecord {
  id: string;
  title: string;
  caseNumber: string;
  parties: string;
  court: string;
  status: CaseStatus;
  caseType: CaseType;
  presidingOfficer: string;
  filedDate?: string;
  nextHearing?: string;
  keyClaims: string;
  keyDefenses: string;
  note?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  caseReference: string;
  evidenceType: EvidenceType;
  admissibility: Admissibility;
  side: Side;
  description: string;
  confidence: Confidence;
  note?: string;
  parentId?: string | null;
}

export interface ScenarioBranch {
  id: string;
  title: string;
  caseReference: string;
  scenarioType: ScenarioType;
  probability: Probability;
  summary: string;
  keyFactors: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  color: string;
  icon: string;
  description: string;
}

export const AGENTS: AgentConfig[] = [
  {
    id: '01KKRZ2KAT4Q2J3QMYDF0PN6FZ',
    name: 'Defense Counsel',
    role: 'defense',
    color: '#60a5fa',
    icon: '⚖️',
    description: 'Prepares your legal strategy and defends your position',
  },
  {
    id: '01KKRZ30QRJJXQFW25AJFFMMB1',
    name: 'Opposition Counsel',
    role: 'opposition',
    color: '#f87171',
    icon: '🗡️',
    description: 'Stress-tests your case by arguing the opposing side',
  },
  {
    id: '01KKRZ3HA3DK1D7ZY4Y7FPES6J',
    name: 'Presiding Judge',
    role: 'judge',
    color: '#a78bfa',
    icon: '🏛️',
    description: 'Controls procedure, rules on objections, and evaluates merit',
  },
  {
    id: '01KKRZ40NHJHCV4K0PJT3NB5TH',
    name: 'Scenario Analyst',
    role: 'analyst',
    color: '#a3e635',
    icon: '📊',
    description: 'Generates scenario branches and strategy reports',
  },
];

export const STATUS_LABELS: Record<CaseStatus, string> = {
  active: 'Active',
  prep: 'Preparation',
  settled: 'Settled',
  closed: 'Closed',
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  active: '#a3e635',
  prep: '#60a5fa',
  settled: '#a78bfa',
  closed: '#6b7280',
};

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  civil: 'Civil',
  labour: 'Labour',
  commercial: 'Commercial',
  property: 'Property',
  family: 'Family',
  criminal: 'Criminal',
};

export const CASE_TYPE_COLORS: Record<CaseType, string> = {
  civil: '#3b82f6',
  labour: '#f97316',
  commercial: '#8b5cf6',
  property: '#10b981',
  family: '#ec4899',
  criminal: '#ef4444',
};

export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  best: 'Best Case',
  likely: 'Likely Outcome',
  worst: 'Worst Case',
  settle: 'Settlement Path',
  collapse: 'Credibility Collapse',
};

export const SCENARIO_COLORS: Record<ScenarioType, string> = {
  best: '#a3e635',
  likely: '#60a5fa',
  worst: '#f87171',
  settle: '#facc15',
  collapse: '#a78bfa',
};

export const SCENARIO_ICONS: Record<ScenarioType, string> = {
  best: '🌟',
  likely: '📊',
  worst: '⚠️',
  settle: '🤝',
  collapse: '💥',
};

export const PROBABILITY_LABELS: Record<Probability, string> = {
  high: 'High (>70%)',
  medium: 'Medium (40-70%)',
  low: 'Low (<40%)',
};

export const ADMISSIBILITY_COLORS: Record<Admissibility, string> = {
  admitted: '#a3e635',
  challenged: '#fb923c',
  excluded: '#f87171',
  pending: '#6b7280',
};
