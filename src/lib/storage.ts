import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Project, ProjectDraft } from '../types/project';

const LOCAL_STORAGE_KEY = 'portfolio_showcase_projects_v1';
const DRAFT_STORAGE_KEY = 'portfolio_project_draft_v1';

// Sample IDs to actively purge if previously seeded
const SAMPLE_IDS = ['proj-1', 'proj-2', 'proj-3', 'proj-4', 'proj-5', 'proj-6'];

// Purge any lingering sample projects from Firestore and local storage
export async function purgeAllSampleData(): Promise<void> {
  const path = 'projects';
  try {
    const snap = await getDocs(collection(db, path));
    const batch = writeBatch(db);
    let hasDeletions = false;

    snap.forEach((docSnap) => {
      if (SAMPLE_IDS.includes(docSnap.id)) {
        batch.delete(docSnap.ref);
        hasDeletions = true;
      }
    });

    if (hasDeletions) {
      await batch.commit();
      console.log('Purged all sample projects from Firestore');
    }

    // Clean local storage
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const list: Project[] = JSON.parse(cached);
      const filtered = list.filter(p => !SAMPLE_IDS.includes(p.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.warn('Error purging sample data from Firestore:', error);
  }
}

// Subscribe to real-time project updates from Firestore
export function subscribeProjects(
  onUpdate: (projects: Project[], isSyncing: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = 'projects';

  // Read local cache first
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as Project[];
      const cleaned = parsed.filter(p => !SAMPLE_IDS.includes(p.id));
      onUpdate(cleaned, true);
    } else {
      onUpdate([], true);
    }
  } catch (e) {
    onUpdate([], true);
  }

  // Purge any lingering sample data immediately on start
  purgeAllSampleData().catch(console.error);

  // Real-time Firestore subscription
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((docSnap) => {
        // Exclude any sample mock projects
        if (!SAMPLE_IDS.includes(docSnap.id)) {
          const data = docSnap.data() as Project;
          items.push({
            ...data,
            id: docSnap.id || data.id,
          });
        }
      });

      // Sort by order or creation
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage quota limit', e);
      }

      onUpdate(items, false);
    },
    (error) => {
      console.warn('Firestore subscription offline/failed, using local mode:', error.message);
      if (onError) onError(error);
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as Project[];
          onUpdate(parsed.filter(p => !SAMPLE_IDS.includes(p.id)), false);
        } else {
          onUpdate([], false);
        }
      } catch (e) {
        onUpdate([], false);
      }
    }
  );

  return unsubscribe;
}

// Helper to strip undefined values which Firestore forbids
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// Save or update a project
export async function saveProject(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    const ref = doc(db, 'projects', project.id);
    const cleanData = sanitizeForFirestore({
      ...project,
      liveUrl: project.liveUrl || '',
      repoUrl: project.repoUrl || '',
      updatedAt: new Date().toISOString()
    });

    await setDoc(ref, cleanData, { merge: true });

    // Also update local storage cache immediately
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: Project[] = cached ? JSON.parse(cached) : [];
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...project, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(project);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    const ref = doc(db, 'projects', projectId);
    await deleteDoc(ref);

    // Update local cache
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const list: Project[] = JSON.parse(cached);
      const filtered = list.filter(p => p.id !== projectId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Delete all projects completely from database and local storage
export async function clearAllProjects(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.warn('Clear in Firestore failed, clearing local cache only', error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

// Form Draft persistence (localStorage)
export function saveDraft(draft: ProjectDraft): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn('Failed to save draft to localStorage', e);
  }
}

export function getDraft(): ProjectDraft | null {
  try {
    const data = localStorage.getItem(DRAFT_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear draft', e);
  }
}
