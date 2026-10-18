import React from 'react';
import { motion } from 'framer-motion';
import { Scale, LayoutDashboard, BookOpen, Info } from 'lucide-react';

type View = 'dashboard' | 'knowledge';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  selectedCaseName?: string;
}

const LIME = '#a3e635';

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navItems: Array<{ id: View; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: 'Matters', icon: LayoutDashboard },
    { id: 'knowledge', label: 'Legal Sources', icon: BookOpen },
  ];

  return (
    <div className="vx-glass vx-grid-texture w-60 flex-shrink-0 h-full flex flex-col relative overflow-hidden" style={{ borderRight: '1px solid rgba(163,230,53,0.12)' }}>

      {/* ── FX 1: Slow vertical scan line ── */}
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent 0%, ${LIME}60 30%, ${LIME}cc 50%, ${LIME}60 70%, transparent 100%)`,
          boxShadow: `0 0 10px 2px ${LIME}55`,
        }}
        initial={{ top: '-2%' }}
        animate={{ top: '102%' }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />

      {/* ── FX 2: Corner radial glow ── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 w-52 h-52 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse at top left, ${LIME}1a 0%, transparent 65%)` }}
      />

      {/* ── FX 3: Right-edge breathing glow ── */}
      <motion.div
        aria-hidden
        className="absolute top-0 right-0 bottom-0 w-px pointer-events-none z-10"
        style={{ background: `linear-gradient(to bottom, transparent 0%, ${LIME}00 15%, ${LIME}90 50%, ${LIME}00 85%, transparent 100%)` }}
        animate={{ opacity: [0.25, 1, 0.25] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Logo ── */}
      <div
        className="px-4 pt-5 pb-4 flex-shrink-0 relative z-20"
        style={{ borderBottom: `1px solid rgba(163,230,53,0.14)` }}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing icon */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ border: `1px solid ${LIME}`, boxShadow: `0 0 10px ${LIME}60` }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${LIME}18`, border: `1px solid ${LIME}35` }}
            >
              <Scale className="w-4.5 h-4.5" style={{ color: LIME }} />
            </div>
          </div>
          {/* Wordmark */}
          <div>
            <p className="text-sm font-black tracking-widest uppercase text-foreground leading-none">
              Geo<span style={{ color: LIME }}>Logix</span>
            </p>
            <p className="vx-eyebrow mt-0.5" style={{ fontSize: '0.55rem' }}>Legal AI · Simulation</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 relative z-20">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeView === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            {activeView === id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: `${LIME}14`,
                  border: `1px solid ${LIME}30`,
                  boxShadow: `0 0 12px ${LIME}25`,
                }}
              />
            )}
            <Icon className="w-4 h-4 relative flex-shrink-0" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Footer disclaimer ── */}
      <div className="px-3 pb-4 flex-shrink-0 relative z-20">
        <div className="rounded-xl p-3" style={{ background: 'rgba(163,230,53,0.06)', border: `1px solid ${LIME}20` }}>
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: LIME }} />
            <div>
              <p className="vx-eyebrow mb-1" style={{ fontSize: '0.6rem' }}>Simulation Only</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                GeoLogix is a preparation system — not legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
