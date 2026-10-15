import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Link as LinkIcon,
  Trash2, 
  Star, 
  Plus, 
  Sparkles, 
  Eye, 
  Edit3, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Project, ProjectDraft } from '../types/project';
import { saveDraft, getDraft, clearDraft } from '../lib/storage';
import { TactileMarkdown } from './TactileMarkdown';

interface ProjectDrawerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  editingProject?: Project | null;
}

const CATEGORIES: Project['category'][] = [
  'Full-Stack',
  'AI / ML',
  'Frontend',
  'Mobile',
  'Developer Tools',
  'Open Source'
];

export const ProjectDrawerForm: React.FC<ProjectDrawerFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProject = null,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<Project['category']>('Full-Stack');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftBanner, setDraftBanner] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore draft
  useEffect(() => {
    if (!isOpen) return;

    if (editingProject) {
      // Editing existing project
      setTitle(editingProject.title);
      setTagline(editingProject.tagline);
      setCategory(editingProject.category);
      setDescription(editingProject.description);
      setTags(editingProject.tags || []);
      setLiveUrl(editingProject.liveUrl || '');
      setRepoUrl(editingProject.repoUrl || '');
      setFeatured(!!editingProject.featured);
      const imgList = editingProject.images && editingProject.images.length > 0
        ? editingProject.images
        : editingProject.coverImage ? [editingProject.coverImage] : [];
      setImages(imgList);
      setCoverIndex(0);
      setDraftBanner(null);
    } else {
      // Check for saved localStorage draft
      const draft = getDraft();
      if (draft && (draft.title || draft.description || draft.tagline)) {
        setTitle(draft.title || '');
        setTagline(draft.tagline || '');
        setCategory(draft.category || 'Full-Stack');
        setDescription(draft.description || '');
        setTags(draft.tags || []);
        setLiveUrl(draft.liveUrl || '');
        setRepoUrl(draft.repoUrl || '');
        setFeatured(!!draft.featured);
        setImages(draft.images || (draft.coverImage ? [draft.coverImage] : []));
        setCoverIndex(0);
        setDraftBanner(`Restored auto-saved draft from ${new Date(draft.savedAt).toLocaleTimeString()}`);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingProject]);

  // Auto-save draft on changes (only when creating new project)
  useEffect(() => {
    if (!isOpen || editingProject) return;
    if (!title && !description && !tagline && images.length === 0 && tags.length === 0) return;

    const draftData: ProjectDraft = {
      title,
      tagline,
      category,
      description,
      tags,
      coverImage: images[coverIndex] || '',
      images,
      liveUrl,
      repoUrl,
      featured,
      savedAt: new Date().toISOString()
    };
    saveDraft(draftData);
  }, [title, tagline, category, description, tags, images, coverIndex, liveUrl, repoUrl, featured, isOpen, editingProject]);

  const resetForm = () => {
    setTitle('');
    setTagline('');
    setCategory('Full-Stack');
    setDescription('');
    setTags([]);
    setLiveUrl('');
    setRepoUrl('');
    setFeatured(false);
    setImages([]);
    setCoverIndex(0);
    setCustomImageUrl('');
    setDraftBanner(null);
  };

  const handleClearDraft = () => {
    clearDraft();
    resetForm();
    setDraftBanner(null);
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Add Custom Image URL
  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (trimmed && !images.includes(trimmed)) {
      setImages([...images, trimmed]);
      setCustomImageUrl('');
    }
  };

  // Drag and drop image upload handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processImageFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      processImageFiles(files);
    }
  };

  const processImageFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          const dataUrl = loadEvent.target.result as string;
          setImages(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Reorder images
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (coverIndex >= index && coverIndex > 0) {
      setCoverIndex(coverIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) {
      alert('Please enter a Project Title and Tagline.');
      return;
    }

    setIsSubmitting(true);
    try {
      const coverImage = images[coverIndex] || images[0] || '';

      const projectData: Project = {
        id: editingProject ? editingProject.id : `proj-${Date.now()}`,
        title: title.trim(),
        tagline: tagline.trim(),
        category,
        description: description.trim(),
        tags: tags.length > 0 ? tags : ['Web'],
        coverImage,
        images: images.length > 0 ? images : (coverImage ? [coverImage] : []),
        liveUrl: liveUrl.trim() || '',
        repoUrl: repoUrl.trim() || '',
        featured,
        order: editingProject?.order ?? 99,
        createdAt: editingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(projectData);
      clearDraft();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please check network/permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-full flex flex-col bg-[var(--color-card)] border-l border-white/20 dark:border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-[var(--color-card)] z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] flex items-center justify-center font-bold">
              {editingProject ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {editingProject ? 'Edit Showcase Project' : 'Add New Showcase Project'}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {editingProject ? 'Update public details and screenshots' : 'Draft auto-saves automatically in your browser'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full tactile-btn-secondary flex items-center justify-center text-[var(--color-text-primary)]"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-save Draft Banner */}
        {draftBanner && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-[var(--color-lavender-soft)]/50 text-[var(--color-lavender-dark)] dark:text-[#E4DCFF] text-xs border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{draftBanner}</span>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="flex items-center gap-1 font-semibold underline hover:opacity-80"
            >
              <RotateCcw className="w-3 h-3" />
              Discard Draft
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Next.js Web App"
                className="w-full h-11 px-3.5 rounded-xl tactile-inset text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Tagline / Short Summary *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. High-performance dashboard with real-time updates"
                className="w-full h-11 px-3.5 rounded-xl tactile-inset text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Project['category'])}
                  className="w-full h-11 px-3.5 rounded-xl tactile-inset text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)] cursor-pointer bg-[var(--color-inset)]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded-md accent-[var(--color-sage-base)] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Feature on top
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--color-inset)]/60 border border-black/5 dark:border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Live Demo URL 🌐
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-10 px-3 rounded-xl bg-[var(--color-card)] text-xs text-[var(--color-text-primary)] border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                GitHub Repository URL 🐙
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/nutjukka/..."
                className="w-full h-10 px-3 rounded-xl bg-[var(--color-card)] text-xs text-[var(--color-text-primary)] border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
              />
            </div>
          </div>

          {/* Tech Stack Tags Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Tech Stack Badges (#React, #TypeScript, etc.)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag (e.g. Next.js, Python, React) and press Enter"
                className="flex-1 h-10 px-3.5 rounded-xl tactile-inset text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="tactile-btn tactile-btn-secondary !min-h-[40px] !py-1 text-xs"
              >
                Add Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-inset)] text-[var(--color-sage-dark)] dark:text-[#A9D1C2] border border-black/5 dark:border-white/5"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 ml-0.5 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Drag and Drop Uploader */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Project Screenshots ({images.length} added)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[var(--color-sage-base)] hover:underline font-medium"
              >
                + Browse Local Files
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[var(--color-sage-base)] bg-[var(--color-sage-light)]/40'
                  : 'border-black/15 dark:border-white/15 tactile-inset hover:border-[var(--color-sage-base)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[var(--color-card)] flex items-center justify-center shadow-sm text-[var(--color-sage-base)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-[var(--color-text-primary)]">
                Drag & drop screenshots here, or click to upload
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                PNG, JPG, WebP supported.
              </p>
            </div>

            {/* Paste Image URL field */}
            <div className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-3.5" />
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="Or paste an image URL here..."
                  className="w-full h-10 pl-8 pr-3 rounded-xl tactile-inset text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="tactile-btn tactile-btn-secondary !min-h-[40px] !py-1 text-xs"
              >
                Add URL
              </button>
            </div>

            {/* Image Preview List & Reordering */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 group bg-black/5 aspect-[16/10] ${
                      coverIndex === idx ? 'border-[var(--color-sage-base)] ring-2 ring-[var(--color-sage-base)]/40' : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Badge: Cover */}
                    {coverIndex === idx && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-sage-base)] text-white shadow-sm">
                        Cover
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'left')}
                          className="w-7 h-7 rounded bg-white/90 text-black flex items-center justify-center text-xs"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCoverIndex(idx)}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                          coverIndex === idx ? 'bg-amber-400 text-black' : 'bg-white/90 text-black'
                        }`}
                        title="Set as Cover"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'right')}
                          className="w-7 h-7 rounded bg-white/90 text-black flex items-center justify-center text-xs"
                          title="Move right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center text-xs"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Full Description with Live Preview Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Full Description (Markdown Supported)
              </label>

              {/* Write vs Preview Tab */}
              <div className="flex items-center rounded-lg bg-[var(--color-inset)] p-0.5 border border-black/5 dark:border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'write' ? 'bg-[var(--color-card)] font-semibold shadow-sm' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'preview' ? 'bg-[var(--color-card)] font-semibold shadow-sm' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                rows={9}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your markdown description, architecture, key highlights here..."
                className="w-full p-4 rounded-xl tactile-inset text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)] resize-y leading-relaxed"
              />
            ) : (
              <div className="p-4 rounded-xl bg-[var(--color-card)] border border-black/5 dark:border-white/5 tactile-inset min-h-[160px]">
                <TactileMarkdown content={description || '_No description provided yet._'} />
              </div>
            )}
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-[var(--color-card)] z-10">
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn tactile-btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="tactile-btn tactile-btn-primary flex items-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <span>Saving to Firestore...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{editingProject ? 'Save Changes' : 'Publish Project'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
