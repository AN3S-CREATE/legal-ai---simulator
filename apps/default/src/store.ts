// GeoLogix Legal AI — Zustand Store
import { create } from 'zustand';
import type { CaseRecord, EvidenceItem, ScenarioBranch, AgentRole, CaseStatus } from './types';
import { fetchCases, fetchEvidence, fetchScenarios } from './api';

interface AppState {
  // Data
  cases: CaseRecord[];
  evidence: EvidenceItem[];
  scenarios: ScenarioBranch[];
  // Loading
  casesLoading: boolean;
  evidenceLoading: boolean;
  scenariosLoading: boolean;
  // Active selections
  activeCaseId: string | null;
  activeAgentRole: AgentRole | null;
  // Live scenario counter — increments each time an agent auto-saves a scenario
  newScenarioCount: number;
  incrementNewScenarioCount: () => void;
  resetNewScenarioCount: () => void;
  // Actions
  loadCases: () => Promise<void>;
  loadEvidence: (caseRef?: string) => Promise<void>;
  loadScenarios: (caseRef?: string) => Promise<void>;
  setActiveCase: (id: string | null) => void;
  setActiveAgent: (role: AgentRole | null) => void;
  getActiveCase: () => CaseRecord | null;
  /** Optimistically mutate the status of a case in the local array */
  patchCaseStatus: (id: string, status: CaseStatus) => void;
  /** Optimistically mutate any field(s) of a case in the local array */
  patchCaseField: (id: string, fields: Partial<CaseRecord>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  cases: [],
  evidence: [],
  scenarios: [],
  casesLoading: false,
  evidenceLoading: false,
  scenariosLoading: false,
  activeCaseId: null,
  activeAgentRole: null,
  newScenarioCount: 0,
  incrementNewScenarioCount: () => set((s) => ({ newScenarioCount: s.newScenarioCount + 1 })),
  resetNewScenarioCount: () => set({ newScenarioCount: 0 }),

  loadCases: async () => {
    set({ casesLoading: true });
    try {
      const cases = await fetchCases();
      set({ cases, casesLoading: false });
    } catch {
      set({ casesLoading: false });
    }
  },

  loadEvidence: async (caseRef?: string) => {
    set({ evidenceLoading: true });
    try {
      const evidence = await fetchEvidence(caseRef);
      set({ evidence, evidenceLoading: false });
    } catch {
      set({ evidenceLoading: false });
    }
  },

  loadScenarios: async (caseRef?: string) => {
    set({ scenariosLoading: true });
    try {
      const scenarios = await fetchScenarios(caseRef);
      set({ scenarios, scenariosLoading: false });
    } catch {
      set({ scenariosLoading: false });
    }
  },

  setActiveCase: (id) => set({ activeCaseId: id }),
  setActiveAgent: (role) => set({ activeAgentRole: role }),

  getActiveCase: () => {
    const { cases, activeCaseId } = get();
    if (!activeCaseId) return null;
    return cases.find((c) => c.id === activeCaseId) ?? null;
  },

  patchCaseStatus: (id, status) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, status } : c)),
    })),

  patchCaseField: (id, fields) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, ...fields } : c)),
    })),
}));
