import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  ExternalLink, 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Project } from '../types/project';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onFilterTag: (tag: string) => void;
  onToggleTheme: () => void;
  isDark: boolean;
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  onOpenAddProject: () => void;
  onResetData: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onFilterTag,
  onToggleTheme,
  isDark,
  isAdmin,
  onOpenAdminAuth,
  onOpenAddProject,
  onResetData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter projects based on query
  const filteredProjects = projects.filter(p => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, 5);

  // Quick action commands
  interface QuickAction {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action: () => void;
  }

  const quickActions: QuickAction[] = [
    {
      id: 'theme',
      icon: isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      title: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Change interface tactile color theme',
      action: () => {
        onToggleTheme();
        onClose();
      }
    },
    {
      id: 'tag-react',
      icon: <Tag className="w-4 h-4 text-cyan-500" />,
      title: 'Filter by #React',
      subtitle: 'View all React ecosystem projects',
      action: () => {
        onFilterTag('React');
        onClose();
      }
    },
    {
      id: 'tag-ts',
      icon: <Tag className="w-4 h-4 text-blue-500" />,
      title: 'Filter by #TypeScript',
      subtitle: 'Strongly typed production apps',
      action: () => {
        onFilterTag('TypeScript');
        onClose();
      }
    },
    {
      id: 'tag-ai',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: 'Filter by AI / ML',
      subtitle: 'Generative models & agentic tools',
      action: () => {
        onFilterTag('Gemini API');
        onClose();
      }
    },
    {
      id: 'admin',
      icon: <ShieldCheck className="w-4 h-4 text-[var(--color-sage-base)]" />,
      title: isAdmin ? 'Admin Active (nutjukka@gmail.com)' : 'Admin Authentication',
      subtitle: isAdmin ? 'Click to open admin dashboard / sign out' : 'Sign in as portfolio administrator',
      action: () => {
        onOpenAdminAuth();
        onClose();
      }
    },
    ...(isAdmin ? [{
      id: 'new-project',
      icon: <Plus className="w-4 h-4 text-emerald-500" />,
      title: 'Add New Project',
      subtitle: 'Open project creator drawer with drag & drop uploader',
      action: () => {
        onOpenAddProject();
        onClose();
      }
    }] : []),
    ...(isAdmin && projects.length > 0 ? [{
      id: 'clear-all',
      icon: <RotateCcw className="w-4 h-4 text-red-500" />,
      title: 'Clear All Projects',
      subtitle: 'Delete all projects from database',
      action: () => {
        onResetData();
        onClose();
      }
    }] : [])
  ].filter(act => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return act.title.toLowerCase().includes(q) || act.subtitle.toLowerCase().includes(q);
  });

  const totalItems = filteredProjects.length + quickActions.length;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredProjects.length) {
        onSelectProject(filteredProjects[selectedIndex]);
        onClose();
      } else {
        const actionIdx = selectedIndex - filteredProjects.length;
        if (quickActions[actionIdx]) {
          quickActions[actionIdx].action();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[var(--color-card)] border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden tactile-raised"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/5 dark:border-white/5 bg-[var(--color-card)]">
          <Search className="w-5 h-5 text-[var(--color-sage-base)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, project name, or #tech..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--color-inset)] text-[var(--color-text-muted)] border border-black/5 dark:border-white/5">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {/* Projects Group */}
          {filteredProjects.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Projects ({filteredProjects.length})
            </div>
          )}

          {filteredProjects.map((proj, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] font-medium shadow-sm'
                    : 'text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-black/10">
                    <img src={proj.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{proj.title}</div>
                    <div className="text-[11px] opacity-75 truncate">{proj.tagline}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    {proj.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </div>
              </div>
            );
          })}

          {/* Actions Group */}
          {quickActions.length > 0 && (
            <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Quick Actions
            </div>
          )}

          {quickActions.map((act, actIdx) => {
            const itemIdx = filteredProjects.length + actIdx;
            const isSelected = selectedIndex === itemIdx;
            return (
              <div
                key={act.id}
                onClick={() => act.action()}
                onMouseEnter={() => setSelectedIndex(itemIdx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] font-medium shadow-sm'
                    : 'text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-inset)] flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/5">
                    {act.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{act.title}</div>
                    <div className="text-[11px] opacity-75">{act.subtitle}</div>
                  </div>
                </div>

                <kbd className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                  ↵
                </kbd>
              </div>
            );
          })}

          {totalItems === 0 && (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
              No matching commands or projects found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-card)]/90 border-t border-black/5 dark:border-white/5 text-[11px] text-[var(--color-text-muted)] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Command Palette</span>
        </div>
      </div>
    </div>
  );
};
