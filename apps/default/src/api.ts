// GeoLogix Legal AI — API Service
import axios from 'axios';
import type { CaseRecord, EvidenceItem, ScenarioBranch } from './types';

const BASE = '/api/taskade';
const PROJECTS = {
  cases: '259uxbeKQK1M4JMx',
  evidence: 'Q4n7yQh1fxdW3F5m',
  knowledge: '65kkHAkqF9TnVnFg',
  scenarios: '9umTDYGtXkXJfTom',
};

// ─── Case Records ────────────────────────────────────────────────────────────

function nodeToCase(node: any): CaseRecord | null {
  const fv = node.fieldValues || {};
  const title = fv['/text'];
  if (!title || node.parentId !== null) return null;
  return {
    id: node.id,
    title,
    caseNumber: fv['/attributes/@caseN'] || '',
    parties: fv['/attributes/@party'] || '',
    court: fv['/attributes/@court'] || '',
    status: fv['/attributes/@statu'] || 'prep',
    caseType: fv['/attributes/@ctype'] || 'civil',
    presidingOfficer: fv['/attributes/@judge'] || 'TBD',
    filedDate: fv['/attributes/@filed'],
    nextHearing: fv['/attributes/@heari'],
    keyClaims: fv['/attributes/@clams'] || '',
    keyDefenses: fv['/attributes/@defns'] || '',
    note: fv['/attributes/note'],
  };
}

export async function fetchCases(): Promise<CaseRecord[]> {
  const { data } = await axios.get(`${BASE}/projects/${PROJECTS.cases}/nodes`);
  const nodes: any[] = data?.payload?.nodes || [];
  return nodes.map(nodeToCase).filter(Boolean) as CaseRecord[];
}

export async function createCase(c: Omit<CaseRecord, 'id'>): Promise<void> {
  await axios.post(`${BASE}/projects/${PROJECTS.cases}/nodes`, {
    '/text': c.title,
    '/attributes/@caseN': c.caseNumber,
    '/attributes/@party': c.parties,
    '/attributes/@court': c.court,
    '/attributes/@statu': c.status,
    '/attributes/@ctype': c.caseType,
    '/attributes/@judge': c.presidingOfficer,
    '/attributes/@clams': c.keyClaims,
    '/attributes/@defns': c.keyDefenses,
  });
}

export async function updateCase(id: string, updates: Partial<CaseRecord>): Promise<void> {
  const body: any = {};
  if (updates.title) body['/text'] = updates.title;
  if (updates.status) body['/attributes/@statu'] = updates.status;
  if (updates.presidingOfficer) body['/attributes/@judge'] = updates.presidingOfficer;
  if (updates.court) body['/attributes/@court'] = updates.court;
  if (updates.keyClaims) body['/attributes/@clams'] = updates.keyClaims;
  if (updates.keyDefenses) body['/attributes/@defns'] = updates.keyDefenses;
  await axios.patch(`${BASE}/projects/${PROJECTS.cases}/nodes/${id}`, body);
}

// ─── Evidence ────────────────────────────────────────────────────────────────

function nodeToEvidence(node: any): EvidenceItem | null {
  const fv = node.fieldValues || {};
  const title = fv['/text'];
  if (!title) return null;
  const ecase = fv['/attributes/@ecase'];
  if (!ecase) return null; // skip section headers
  return {
    id: node.id,
    title,
    caseReference: ecase,
    evidenceType: fv['/attributes/@etyp'] || 'doc',
    admissibility: fv['/attributes/@estar'] || 'pending',
    side: fv['/attributes/@eside'] || 'defense',
    description: fv['/attributes/@edesc'] || '',
    confidence: fv['/attributes/@econf'] || 'medium',
    note: fv['/attributes/note'],
    parentId: node.parentId,
  };
}

export async function fetchEvidence(caseRef?: string): Promise<EvidenceItem[]> {
  const { data } = await axios.get(`${BASE}/projects/${PROJECTS.evidence}/nodes`);
  const nodes: any[] = data?.payload?.nodes || [];
  const items = nodes.map(nodeToEvidence).filter(Boolean) as EvidenceItem[];
  if (caseRef) return items.filter((e) => e.caseReference === caseRef);
  return items;
}

export async function createEvidence(e: Omit<EvidenceItem, 'id'>): Promise<void> {
  await axios.post(`${BASE}/projects/${PROJECTS.evidence}/nodes`, {
    '/text': e.title,
    '/attributes/@ecase': e.caseReference,
    '/attributes/@etyp': e.evidenceType,
    '/attributes/@estar': e.admissibility,
    '/attributes/@eside': e.side,
    '/attributes/@edesc': e.description,
    '/attributes/@econf': e.confidence,
  });
}

export async function updateEvidenceAdmissibility(id: string, admissibility: string): Promise<void> {
  await axios.patch(`${BASE}/projects/${PROJECTS.evidence}/nodes/${id}`, {
    '/attributes/@estar': admissibility,
  });
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

function nodeToScenario(node: any): ScenarioBranch | null {
  const fv = node.fieldValues || {};
  const title = fv['/text'];
  const scase = fv['/attributes/@scase'];
  if (!title || !scase) return null;
  return {
    id: node.id,
    title,
    caseReference: scase,
    scenarioType: fv['/attributes/@stype'] || 'likely',
    probability: fv['/attributes/@sconf'] || 'medium',
    summary: fv['/attributes/@ssumm'] || '',
    keyFactors: fv['/attributes/@skeyf'] || '',
    note: fv['/attributes/note'],
  };
}

export async function fetchScenarios(caseRef?: string): Promise<ScenarioBranch[]> {
  const { data } = await axios.get(`${BASE}/projects/${PROJECTS.scenarios}/nodes`);
  const nodes: any[] = data?.payload?.nodes || [];
  const items = nodes.map(nodeToScenario).filter(Boolean) as ScenarioBranch[];
  if (caseRef) return items.filter((s) => s.caseReference === caseRef);
  return items;
}

export async function createScenario(s: Omit<ScenarioBranch, 'id'>): Promise<void> {
  await axios.post(`${BASE}/projects/${PROJECTS.scenarios}/nodes`, {
    '/text': s.title,
    '/attributes/@scase': s.caseReference,
    '/attributes/@stype': s.scenarioType,
    '/attributes/@sconf': s.probability,
    '/attributes/@ssumm': s.summary,
    '/attributes/@skeyf': s.keyFactors,
  });
}

// ─── Agent Chat ──────────────────────────────────────────────────────────────

export async function createConversation(agentId: string): Promise<string> {
  const { data } = await axios.post(
    `${BASE}/agents/${agentId}/public-conversations`
  );
  return data.conversationId;
}

export function openStream(agentId: string, conversationId: string): EventSource {
  return new EventSource(
    `${BASE}/agents/${agentId}/public-conversations/${conversationId}/stream`
  );
}

export async function sendMessage(
  agentId: string,
  conversationId: string,
  text: string
): Promise<void> {
  await axios.post(
    `${BASE}/agents/${agentId}/public-conversations/${conversationId}/messages`,
    { text }
  );
}
