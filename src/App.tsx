import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  subscribeProjects, 
  saveProject, 
  deleteProject, 
  clearAllProjects 
} from './lib/storage';
import { 
  testConnection, 
  auth, 
  onAuthStateChanged, 
  ADMIN_EMAIL, 
  User 
} from './lib/firebase';
import { Project, CategoryFilter } from './types/project';
import { HeroHeader } from './components/HeroHeader';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { ProjectDrawerForm } from './components/ProjectDrawerForm';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CommandPalette } from './components/CommandPalette';
import { AlertCircle, CheckCircle2, FolderSearch, RefreshCw } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  
  // Modals & Drawers state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Admin authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('portfolio_admin_mode') === 'true';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portfolio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portfolio_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdminMode(true);
        localStorage.setItem('portfolio_admin_mode', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Connection check & Firestore Real-time listener
  useEffect(() => {
    testConnection().then((connected) => {
      setConnectionStatus(connected ? 'connected' : 'offline');
    });

    const unsubscribe = subscribeProjects(
      (data, syncing) => {
        setProjects(data);
        setIsSyncing(syncing);
        setConnectionStatus('connected');
      },
      (error) => {
        console.warn('Realtime sync status:', error);
        setConnectionStatus('offline');
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Global Keyboard Shortcuts (Cmd+K, Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      // Cmd/Ctrl + Shift + A for Admin shortcut
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminAuthOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute all tags with counts
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      p.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = project.title.toLowerCase().includes(q);
          const matchTagline = project.tagline.toLowerCase().includes(q);
          const matchCategory = project.category.toLowerCase().includes(q);
          const matchTags = project.tags.some(t => t.toLowerCase().includes(q));
          const matchDesc = project.description.toLowerCase().includes(q);
          if (!matchTitle && !matchTagline && !matchCategory && !matchTags && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && project.category !== selectedCategory) {
          return false;
        }

        // Tech Stack tags filter
        if (selectedTags.length > 0) {
          const hasAllSelectedTags = selectedTags.every(t => project.tags.includes(t));
          if (!hasAllSelectedTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (a.order ?? 99) - (b.order ?? 99);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [projects, searchQuery, selectedCategory, selectedTags, sortBy]);

  // Tag filter toggle
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory !== 'All' || selectedTags.length > 0
  );

  // Admin Project CRUD Operations
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
    setSelectedProject(null);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}" from your portfolio?`)) {
      try {
        await deleteProject(project.id);
        if (selectedProject?.id === project.id) {
          setSelectedProject(null);
        }
        showToast(`Deleted "${project.title}"`, 'info');
      } catch (err) {
        showToast('Error deleting project', 'error');
      }
    }
  };

  const handleSaveProject = async (project: Project) => {
    await saveProject(project);
    showToast(editingProject ? 'Project updated successfully!' : 'New project published to showcase!');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#7C9A8E', '#DCD7EC', '#F5F4F0']
      });
    } catch (e) {
      // Ignored if confetti unavailable
    }
  };

  const handleClearAllProjects = async () => {
    if (window.confirm('Are you sure you want to delete all projects from the database?')) {
      await clearAllProjects();
      showToast('All projects have been cleared', 'info');
    }
  };

  const setAdminModeHandler = (active: boolean) => {
    setIsAdminMode(active);
    localStorage.setItem('portfolio_admin_mode', active ? 'true' : 'false');
    showToast(active ? 'Switched to Admin Mode' : 'Switched to Public Mode', 'info');
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] transition-colors duration-200">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[var(--color-card)] text-[var(--color-text-primary)] border border-white/40 dark:border-white/10 shadow-xl tactile-raised animate-in slide-in-from-bottom duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {toast.type === 'info' && <RefreshCw className="w-4 h-4 text-[var(--color-sage-base)]" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero & Navigation Bar */}
        <HeroHeader
          totalProjects={projects.length}
          totalTags={allTagsWithCounts.length}
          featuredCount={projects.filter(p => p.featured).length}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isAdmin={isAdminMode}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
          onOpenAddProject={handleOpenAddProject}
        />

        {/* Search, Categories, Tech Stack Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          allTagsWithCounts={allTagsWithCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalFiltered={filteredProjects.length}
        />

        {/* Project Grid / Masonry Layout */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
                onTagClick={handleToggleTag}
                isAdmin={isAdminMode}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          /* Tactile Empty State */
          <div className="py-16 text-center space-y-4 rounded-3xl bg-[var(--color-card)] border border-black/5 dark:border-white/5 tactile-inset p-8">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-inset)] text-[var(--color-sage-base)] flex items-center justify-center mx-auto shadow-sm">
              <FolderSearch className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {projects.length === 0 ? 'No projects added yet' : 'No matching projects found'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                {projects.length === 0 
                  ? 'Your portfolio is completely clean and ready. Click below to add your first real project.'
                  : 'No projects matched your search criteria. Try removing filters.'}
              </p>
            </div>
            {projects.length === 0 ? (
              <button
                type="button"
                onClick={handleOpenAddProject}
                className="tactile-btn tactile-btn-primary text-xs"
              >
                + Add Project
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearFilters}
                className="tactile-btn tactile-btn-primary text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Bottom Public Showcase Footer */}
        <footer className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Firestore Database Connected • Tactile Soft-UI Design System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cmd+K Palette
            </button>
            {isAdminMode && projects.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllProjects}
                className="hover:text-red-500 transition-colors"
              >
                Clear All Projects
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdminAuthOpen(true)}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              {isAdminMode ? 'Admin Settings' : 'Admin Login'}
            </button>
          </div>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        isAdmin={isAdminMode}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onTagClick={handleToggleTag}
      />

      {/* Project Add / Edit Drawer Form */}
      <ProjectDrawerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        currentUser={currentUser}
        isAdminMode={isAdminMode}
        onSetAdminMode={setAdminModeHandler}
      />

      {/* Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        onSelectProject={setSelectedProject}
        onFilterTag={handleToggleTag}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        isAdmin={isAdminMode}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        onOpenAddProject={handleOpenAddProject}
        onResetData={handleClearAllProjects}
      />
    </div>
  );
}
