import React, { useState } from 'react';
import { ExternalLink, Github, Sparkles, Layers, Pencil, Trash2 } from 'lucide-react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onTagClick?: (tag: string) => void;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onTagClick,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fallback image generator
  const displayImage = imgError || !project.coverImage 
    ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'
    : project.coverImage;

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative flex flex-col rounded-[22px] overflow-hidden cursor-pointer tactile-card transition-all duration-300 hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-[var(--color-sage-base)]"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      role="button"
      aria-label={`View details for ${project.title}`}
    >
      {/* Thumbnail Container with Inset Frame & Lazy Loading */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--color-inset)] border-b border-black/5 dark:border-white/5">
        {/* Placeholder skeleton while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 flex items-center justify-center">
            <Layers className="w-8 h-8 text-[var(--color-text-muted)] opacity-30 animate-spin" />
          </div>
        )}

        <img
          src={displayImage}
          alt={project.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Top Badges (Category & Featured) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white shadow-sm border border-white/20">
            {project.category}
          </span>

          {project.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--color-lavender-soft)] text-[var(--color-lavender-dark)] dark:bg-[#3B3254] dark:text-[#E4DCFF] shadow-sm border border-white/30 dark:border-white/10">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {/* Admin Quick Action Floating Buttons */}
        {isAdmin && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm text-[var(--color-text-primary)] hover:text-[var(--color-sage-base)] flex items-center justify-center shadow-md transition-transform active:scale-90"
                title="Edit Project"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm text-red-500 hover:text-red-700 flex items-center justify-center shadow-md transition-transform active:scale-90"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 gap-3.5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-sage-base)] transition-colors">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {project.tags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--color-inset)] text-[var(--color-sage-dark)] dark:text-[#A9D1C2] hover:bg-[var(--color-sage-base)] hover:text-white transition-colors border border-black/5 dark:border-white/5"
            >
              #{tag}
            </button>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Direct Action Links Bar */}
        <div
          className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-sage-base)] text-white hover:bg-[#6A8C7F] transition-all shadow-sm active:translate-y-0.5"
                title="Open Live Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Demo
              </a>
            )}

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-inset)] text-[var(--color-text-primary)] hover:text-[var(--color-sage-base)] transition-all border border-black/5 dark:border-white/5 active:translate-y-0.5"
                title="View Source on GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(project)}
            className="text-xs font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] flex items-center gap-1 transition-colors hover:underline"
          >
            Details ↗
          </button>
        </div>
      </div>
    </div>
  );
};
