import React from 'react';
import { Search, X, SlidersHorizontal, Tag, Check } from 'lucide-react';
import { CategoryFilter } from '../types/project';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  allTagsWithCounts: { tag: string; count: number }[];
  sortBy: 'featured' | 'newest' | 'alphabetical';
  onSortChange: (sort: 'featured' | 'newest' | 'alphabetical') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalFiltered: number;
}

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Full-Stack',
  'AI / ML',
  'Frontend',
  'Mobile',
  'Developer Tools',
  'Open Source'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedTags,
  onToggleTag,
  allTagsWithCounts,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  totalFiltered,
}) => {
  return (
    <div className="space-y-4 pt-2 pb-6">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Instant Search Bar with Tactile Inset */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--color-sage-base)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by name, technology, architecture..."
            className="w-full h-11 pl-10 pr-9 rounded-xl tactile-inset text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl bg-[var(--color-inset)] tactile-inset text-xs text-[var(--color-text-muted)] border border-black/5 dark:border-white/5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-sage-base)]" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest First</option>
              <option value="alphabetical">Title A-Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-11 px-3 rounded-xl tactile-btn-secondary text-xs flex items-center gap-1 text-[var(--color-text-muted)] hover:text-red-500 whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`tactile-pill flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[var(--color-sage-base)] text-white shadow-md font-semibold'
                  : 'tactile-btn-secondary text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Tech Stack Badges Quick Chips */}
      {allTagsWithCounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[var(--color-sage-base)]" />
            Tech Stack:
          </span>
          {allTagsWithCounts.slice(0, 10).map(({ tag, count }) => {
            const isTagSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  isTagSelected
                    ? 'bg-[var(--color-lavender-soft)] text-[var(--color-lavender-dark)] dark:bg-[#382F4E] dark:text-[#E8E1FF] border-[var(--color-lavender-dark)]/30 font-semibold shadow-sm'
                    : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border-black/5 dark:border-white/5 hover:border-[var(--color-sage-base)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span>#{tag}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results summary bar */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-1 px-1">
        <span>
          Showing <strong className="text-[var(--color-text-primary)]">{totalFiltered}</strong> project{totalFiltered === 1 ? '' : 's'}
          {selectedCategory !== 'All' && <span> in <strong className="text-[var(--color-text-primary)]">{selectedCategory}</strong></span>}
          {selectedTags.length > 0 && <span> matching <strong>{selectedTags.join(', ')}</strong></span>}
        </span>
      </div>
    </div>
  );
};
