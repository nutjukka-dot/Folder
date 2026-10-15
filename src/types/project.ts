export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Full-Stack' | 'AI / ML' | 'Frontend' | 'Mobile' | 'Developer Tools' | 'Open Source';
  tags: string[];
  coverImage: string;
  images: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export type CategoryFilter = 'All' | 'Full-Stack' | 'AI / ML' | 'Frontend' | 'Mobile' | 'Developer Tools' | 'Open Source';

export interface ProjectDraft {
  title: string;
  tagline: string;
  description: string;
  category: Project['category'];
  tags: string[];
  coverImage: string;
  images: string[];
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  savedAt: string;
}
