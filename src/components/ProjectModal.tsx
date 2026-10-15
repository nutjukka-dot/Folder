import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Github, 
  Sparkles, 
  Calendar, 
  Tag, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Pencil,
  Trash2
} from 'lucide-react';
import { Project } from '../types/project';
import { TactileMarkdown } from './TactileMarkdown';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onTagClick?: (tag: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  isAdmin = false,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [project]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const images = project.images && project.images.length > 0 
    ? project.images 
    : [project.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[26px] bg-[var(--color-card)] border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden tactile-raised"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
      >
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-[var(--color-card)]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] border border-black/5 dark:border-white/5">
              {project.category}
            </span>
            {project.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-lavender-soft)] text-[var(--color-lavender-dark)] dark:bg-[#3B3254] dark:text-[#E4DCFF]">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(project)}
                  className="min-h-[44px] min-w-[44px] rounded-xl tactile-btn-secondary flex items-center justify-center text-xs gap-1.5 px-3"
                  title="Edit Project"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(project)}
                  className="min-h-[44px] min-w-[44px] rounded-xl text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-xs gap-1.5 px-3 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-full tactile-btn-secondary flex items-center justify-center text-[var(--color-text-primary)] hover:bg-black/5 transition-transform active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Screenshot Carousel / Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[var(--color-inset)] border border-black/5 dark:border-white/5 tactile-inset flex items-center justify-center">
              <img
                src={images[activeImageIndex]}
                alt={`${project.title} screenshot ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-top"
              />

              {/* Navigation arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-transform active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-transform active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[var(--color-sage-base)] ring-2 ring-[var(--color-sage-base)]/30 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Tagline & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-black/5 dark:border-white/5 pb-6">
            <div className="space-y-1">
              <h2
                id="modal-project-title"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]"
              >
                {project.title}
              </h2>
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                {project.tagline}
              </p>
            </div>

            {/* Outbound Link Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tactile-btn tactile-btn-primary flex items-center gap-2 text-sm shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Preview
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tactile-btn tactile-btn-secondary flex items-center gap-2 text-sm"
                >
                  <Github className="w-4 h-4" />
                  Source Code
                </a>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--color-inset)] tactile-inset text-xs">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Layers className="w-4 h-4 text-[var(--color-sage-base)]" />
              <span>Category: <strong className="text-[var(--color-text-primary)]">{project.category}</strong></span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Calendar className="w-4 h-4 text-[var(--color-sage-base)]" />
                <span>Published: <strong className="text-[var(--color-text-primary)]">{formattedDate}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Tag className="w-4 h-4 text-[var(--color-sage-base)]" />
              <span>Tech Stacks: <strong className="text-[var(--color-text-primary)]">{project.tags.length} badges</strong></span>
            </div>
          </div>

          {/* Full Tech Stack Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Technologies & Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (onTagClick) {
                      onTagClick(tag);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-inset)] text-[var(--color-sage-dark)] dark:text-[#A9D1C2] border border-black/5 dark:border-white/5 hover:bg-[var(--color-sage-base)] hover:text-white transition-colors cursor-pointer"
                  title={`Filter portfolio by #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Project Architecture & Concept */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Architecture & Concept
            </h4>
            <div className="p-6 rounded-2xl bg-[var(--color-card)] border border-black/5 dark:border-white/5 tactile-inset">
              <TactileMarkdown content={project.description} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-[var(--color-card)]/80 text-xs text-[var(--color-text-muted)]">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-inset)] font-mono text-[11px]">Esc</kbd> to exit</span>
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn tactile-btn-secondary !min-h-[38px] !py-1 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
