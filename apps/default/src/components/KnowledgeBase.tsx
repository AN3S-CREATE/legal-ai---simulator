import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, ChevronRight, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';

interface KBNode {
  id: string;
  title: string;
  note?: string;
  parentId: string | null;
  children?: KBNode[];
}

const KnowledgeBase: React.FC = () => {
  const [nodes, setNodes] = useState<KBNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/taskade/projects/65kkHAkqF9TnVnFg/nodes');
        const raw: any[] = data?.payload?.nodes || [];
        const map = new Map<string, KBNode>();
        const roots: KBNode[] = [];

        raw.forEach((n) => {
          const node: KBNode = {
            id: n.id,
            title: n.fieldValues?.['/text'] || '',
            note: n.fieldValues?.['/attributes/note'],
            parentId: n.parentId,
            children: [],
          };
          map.set(n.id, node);
        });

        map.forEach((node) => {
          if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId)!.children!.push(node);
          } else if (!node.parentId) {
            roots.push(node);
          }
        });

        setNodes(roots);
        // Expand top-level nodes by default
        const topIds = new Set(roots.map((r) => r.id));
        setExpanded(topIds);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchLower = search.toLowerCase();

  const nodeMatchesSearch = (node: KBNode): boolean => {
    if (!search) return true;
    if (node.title.toLowerCase().includes(searchLower)) return true;
    if (node.children?.some(nodeMatchesSearch)) return true;
    return false;
  };

  const renderNode = (node: KBNode, depth = 0): React.ReactNode => {
    if (!nodeMatchesSearch(node)) return null;
    const hasChildren = (node.children?.length || 0) > 0;
    const isOpen = expanded.has(node.id);

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => hasChildren && toggleExpand(node.id)}
          className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors group ${
            depth === 0 ? 'mt-1' : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            )
          ) : (
            <div className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-relaxed ${
                depth === 0
                  ? 'font-semibold text-foreground'
                  : depth === 1
                  ? 'font-medium text-foreground/90'
                  : 'text-muted-foreground'
              }`}
            >
              {search && node.title.toLowerCase().includes(searchLower) ? (
                <HighlightedText text={node.title} highlight={search} />
              ) : (
                node.title
              )}
            </p>
          </div>
        </button>

        {hasChildren && isOpen && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Glassmorphism header ── */}
      <div
        className="vx-glass flex-shrink-0 px-6 pt-6 pb-5 relative overflow-hidden"
        style={{ borderBottom: '1px solid rgba(163,230,53,0.12)' }}
      >
        {/* Animated lime top-edge scan line */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to right, transparent 5%, #a3e635cc 40%, #a3e635ff 50%, #a3e635cc 60%, transparent 95%)',
            boxShadow: '0 0 14px 1px #a3e63560',
          }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Radial bloom top-right */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-64 h-36 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top right, #a3e63514 0%, transparent 70%)',
          }}
        />

        {/* Icon + wordmark row */}
        <div className="flex items-center gap-3 mb-5 relative">
          {/* Pulsing icon */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                border: '1px solid #a3e635',
                boxShadow: '0 0 10px #a3e63560',
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(163,230,53,0.1)',
                border: '1px solid rgba(163,230,53,0.25)',
              }}
            >
              <BookOpen className="w-4.5 h-4.5" style={{ color: '#a3e635' }} />
            </div>
          </div>

          {/* Labels */}
          <div>
            <p className="vx-eyebrow mb-0.5" style={{ fontSize: '0.6rem' }}>
              Legal Sources
            </p>
            <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
              SA Knowledge Base
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Statutes, case law &amp; procedural rules
            </p>
          </div>
        </div>

        {/* Pill search bar */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: '#6b7280' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search legal sources…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid rgba(163,230,53,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(163,230,53,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {/* Clear button */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: '0.65rem', lineHeight: 1 }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Source tree */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No legal sources found.
          </div>
        ) : (
          nodes.map((node) => renderNode(node))
        )}
      </div>

      {/* Footer note */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid rgba(163,230,53,0.1)' }}
      >
        <p className="text-[10px] text-muted-foreground text-center tracking-wide uppercase" style={{ letterSpacing: '0.06em' }}>
          Simulation reference only · Verify all citations independently
        </p>
      </div>
    </div>
  );
};

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-foreground rounded px-0.5">{text.slice(idx, idx + highlight.length)}</mark>
      {text.slice(idx + highlight.length)}
    </>
  );
}

export default KnowledgeBase;
