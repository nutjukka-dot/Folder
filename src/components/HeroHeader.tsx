import React from 'react';
import { 
  Terminal, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Github, 
  Linkedin, 
  Mail, 
  Code2, 
  Cpu, 
  Globe2, 
  FolderGit2
} from 'lucide-react';
import { ADMIN_EMAIL } from '../lib/firebase';

interface HeroHeaderProps {
  totalProjects: number;
  totalTags: number;
  featuredCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  onOpenAddProject: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  totalProjects,
  totalTags,
  featuredCount,
  isDark,
  onToggleTheme,
  onOpenCommandPalette,
  isAdmin,
  onOpenAdminAuth,
  onOpenAddProject,
}) => {
  return (
    <header className="w-full pt-8 pb-6 space-y-6">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Branding Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl tactile-raised flex items-center justify-center font-mono font-bold text-base text-[var(--color-sage-base)] border border-white/60 dark:border-white/10">
            NJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[var(--color-text-primary)]">
                Nut Jukka
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Open for work
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
              Full-Stack & Multimodal AI Engineer
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Command Palette Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="tactile-btn tactile-btn-secondary !min-h-[40px] !py-1.5 px-3 text-xs gap-2 hidden sm:flex"
            title="Quick Search & Actions (Cmd+K)"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--color-sage-base)]" />
            <span className="text-[var(--color-text-muted)]">Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-inset)] text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[40px] min-w-[40px] rounded-xl tactile-btn-secondary flex items-center justify-center text-[var(--color-text-primary)]"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Admin Management Button */}
          <button
            type="button"
            onClick={onOpenAdminAuth}
            className={`min-h-[40px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
              isAdmin
                ? 'bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] border border-[var(--color-sage-base)] shadow-sm'
                : 'tactile-btn-secondary text-[var(--color-text-muted)]'
            }`}
            title="Admin Management"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-sage-base)]" />
            <span className="hidden md:inline">{isAdmin ? 'Admin Active' : 'Admin'}</span>
          </button>

          {/* Add Project Button (Shown if Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddProject}
              className="tactile-btn tactile-btn-primary !min-h-[40px] !py-1 px-3.5 text-xs gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tactile Hero Card */}
      <div className="relative p-6 sm:p-8 rounded-[24px] tactile-card border border-white/60 dark:border-white/10 overflow-hidden">
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-lavender-soft)]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[var(--color-sage-light)]/30 rounded-full blur-2xl pointer-events-none -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-inset)] text-[var(--color-sage-dark)] dark:text-[#A9D1C2] border border-black/5 dark:border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-sage-base)]" />
              <span>Engineering Systems, Multi-Agent AI & Tactile Interfaces</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
              Selected Works & Architectural Explorations
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              A curated catalog of production web applications, low-latency developer tooling, and distributed systems. Built with clean software craft and tactile soft-UI aesthetics.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/nutjukka"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-inset)] text-[var(--color-text-primary)] hover:text-[var(--color-sage-base)] border border-black/5 dark:border-white/5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
              <a
                href="mailto:nutjukka@gmail.com"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-inset)] text-[var(--color-text-primary)] hover:text-[var(--color-sage-base)] border border-black/5 dark:border-white/5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                nutjukka@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Metrics Stats Bar */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-[var(--color-inset)] tactile-inset flex-shrink-0 md:min-w-[240px]">
            <div className="p-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <FolderGit2 className="w-3.5 h-3.5 text-[var(--color-sage-base)]" />
                <span>Showcase</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {totalProjects}
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {featuredCount}
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Code2 className="w-3.5 h-3.5 text-[var(--color-lavender-dark)] dark:text-[#D4CBF2]" />
                <span>Tech Badges</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {totalTags}
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Deploy</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                100%
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
