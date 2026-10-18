import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaseDetail from './components/CaseDetail';
import KnowledgeBase from './components/KnowledgeBase';
import VxAssistant from './components/VxAssistant';
import { useStore } from './store';

type View = 'dashboard' | 'knowledge';

const App: React.FC = function () {
  const [navView, setNavView] = useState<View>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseName, setSelectedCaseName] = useState<string | undefined>();
  const cases = useStore((s) => s.cases);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Bug 1 fix: populate case name for Sidebar breadcrumb
  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const found = cases.find((c) => c.id === id);
    setSelectedCaseName(found?.title);
  };

  const handleBack = () => {
    setSelectedCaseId(null);
  };

  const handleNavigate = (view: View) => {
    setNavView(view);
    setSelectedCaseId(null);
  };

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={navView}
        onNavigate={handleNavigate}
        selectedCaseName={selectedCaseName}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {navView === 'knowledge' ? (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <KnowledgeBase />
            </motion.div>
          ) : selectedCaseId ? (
            <motion.div
              key={`case-${selectedCaseId}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CaseDetail caseId={selectedCaseId} onBack={handleBack} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Dashboard onSelectCase={handleSelectCase} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Veralogix Legal Assistant */}
      <VxAssistant />
    </div>
  );
};

export default App;

