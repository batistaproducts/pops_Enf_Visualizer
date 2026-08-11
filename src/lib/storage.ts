/**
 * Antonio Batista - [POPs Enfermagem] - 2026-08-10
 */
import { PopItem, Hospital, GitHubConfig, UserProfile } from '../types';
import { EXAMPLE_POPS } from './exampleData';

const STORAGE_KEYS = {
  POPS: 'enfermapop_pops_v2',
  HOSPITALS: 'enfermapop_hospitals_v2',
  GITHUB_CONFIG: 'enfermapop_github_config_v2',
  USER_PROFILE: 'enfermapop_user_profile_v2',
  OFFLINE_SAVED: 'enfermapop_offline_saved_v2',
  BOOKMARKS: 'enfermapop_bookmarks_v2',
};

// IndexedDB Helper for Large Data Storage
const IDB_NAME = 'EnfermaPopDB';
const IDB_STORE = 'pops_store';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPopsFromIDB(): Promise<PopItem[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get('pops_list');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setPopsToIDB(pops: PopItem[]): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(pops, 'pops_list');
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Default User Profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Enf. Maria Oliveira',
  role: 'standard',
  coren: 'COREN-SP 245.890',
  selectedHospitalId: 'hosp-001',
};

// Default GitHub Config
export const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  owner: 'batistaproducts',
  repo: 'pops_Enf_Visualizer',
  branch: 'main',
  personalToken: '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',
  autoSync: true,
  lastSync: new Date().toISOString(),
  syncStatus: 'synced',
  dataFilePath: 'pops_data.json',
  hospitalsFilePath: 'hospitals.json',
};

// Fetch initial JSON files from root or local storage
export async function initializeAppData(): Promise<{
  pops: PopItem[];
  hospitals: Hospital[];
  githubConfig: GitHubConfig;
  userProfile: UserProfile;
  offlineSavedIds: string[];
  bookmarkIds: string[];
}> {
  console.log('Antonio Batista - [POPs Enfermagem] - 2026-08-10 - Inicializando Dados');
  
  // 1. User Profile
  let userProfile = DEFAULT_USER_PROFILE;
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (storedUser) {
      userProfile = JSON.parse(storedUser);
    }
  } catch {
    // fallback
  }

  // 2. Offline saved & bookmarks
  let offlineSavedIds: string[] = ['pop-001', 'pop-002'];
  try {
    const storedOffline = localStorage.getItem(STORAGE_KEYS.OFFLINE_SAVED);
    if (storedOffline) offlineSavedIds = JSON.parse(storedOffline);
  } catch {
    // fallback
  }

  let bookmarkIds: string[] = ['pop-001'];
  try {
    const storedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (storedBookmarks) bookmarkIds = JSON.parse(storedBookmarks);
  } catch {
    // fallback
  }

  // 3. GitHub Config
  let githubConfig = DEFAULT_GITHUB_CONFIG;
  try {
    // Sempre tenta buscar o arquivo github_config.json primeiro (prioridade do arquivo)
    let fileConfig: Partial<GitHubConfig> = {};
    try {
      const res = await fetch(`/github_config.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        fileConfig = await res.json();
        console.log('Antonio Batista - [POPs Enfermagem] - Config GitHub carregada com sucesso');
      }
    } catch (e) {
      console.warn('Erro ao buscar github_config.json', e);
    }

    const storedConfig = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
    if (storedConfig) {
      const parsedStorage = JSON.parse(storedConfig);
      // Mescla: Padrão < LocalStorage < Arquivo (Arquivo tem prioridade total)
      githubConfig = { 
        ...DEFAULT_GITHUB_CONFIG, 
        ...parsedStorage, 
        ...fileConfig 
      };
      
      // Forçar o token do arquivo se ele existir
      if (fileConfig.personalToken) {
        githubConfig.personalToken = fileConfig.personalToken;
      }
    } else {
      githubConfig = { ...DEFAULT_GITHUB_CONFIG, ...fileConfig };
    }
  } catch {
    // fallback
  }

  // 4. Hospitals
  let hospitals: Hospital[] = [];
  try {
    const storedHospitals = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    if (storedHospitals) {
      hospitals = JSON.parse(storedHospitals);
    } else {
      const res = await fetch(`/hospitals.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        hospitals = await res.json();
      }
    }
  } catch {
    // fallback
  }

  // 5. POPs (Prefer IndexedDB then LocalStorage)
  let pops: PopItem[] = [];
  try {
    const idbPops = await getPopsFromIDB();
    if (idbPops && idbPops.length > 0) {
      pops = idbPops;
    } else {
      const storedPops = localStorage.getItem(STORAGE_KEYS.POPS);
      if (storedPops) {
        pops = JSON.parse(storedPops);
      } else {
        const res = await fetch(`/pops_data.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          pops = await res.json();
        }
      }
    }
  } catch {
    // fallback
  }

  // Final Fallback: Garantir que os exemplos apareçam se não houver dados ou se não estiver sincronizado
  const isGitHubConnected = !!githubConfig.personalToken && !!githubConfig.owner && !!githubConfig.repo;
  const isSynced = githubConfig.syncStatus === 'synced';
  
  if (!pops || pops.length === 0) {
    pops = [...EXAMPLE_POPS];
    console.log('Antonio Batista - [POPs Enfermagem] - Usando fallback de exemplos');
  } else {
    const hasExamples = pops.some(p => p.id.startsWith('example-'));
    if (!hasExamples && (!isGitHubConnected || !isSynced)) {
      pops = [...EXAMPLE_POPS, ...pops];
    }
  }

  return {
    pops,
    hospitals,
    githubConfig,
    userProfile,
    offlineSavedIds,
    bookmarkIds,
  };
}

// Persistence helpers
export function savePopsToStorage(pops: PopItem[]) {
  // Save to IndexedDB to accommodate large PDF data URLs without quota limits
  setPopsToIDB(pops);

  try {
    localStorage.setItem(STORAGE_KEYS.POPS, JSON.stringify(pops));
  } catch (err) {
    console.warn('LocalStorage quota exceeded for POPs, saving lightweight fallback to localStorage:', err);
    try {
      // Save without heavy customPdfDataUrl in localStorage (IndexedDB retains full binary data)
      const lightweightPops = pops.map((p) => {
        if (p.customPdfDataUrl && p.customPdfDataUrl.length > 50000) {
          const { customPdfDataUrl, ...rest } = p;
          return rest;
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.POPS, JSON.stringify(lightweightPops));
    } catch (e) {
      console.error('Failed to save fallback POPs to localStorage:', e);
    }
  }
}

export function saveHospitalsToStorage(hospitals: Hospital[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  } catch (err) {
    console.error('Error saving Hospitals to storage:', err);
  }
}

export function saveGitHubConfigToStorage(config: GitHubConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving GitHub Config:', err);
  }
}

export function saveUserProfileToStorage(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving User Profile:', err);
  }
}

export function saveOfflineIdsToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_SAVED, JSON.stringify(ids));
  } catch (err) {
    console.error('Error saving Offline IDs:', err);
  }
}

export function saveBookmarksToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(ids));
  } catch (err) {
    console.error('Error saving Bookmarks:', err);
  }
}

// Helper to convert uploaded File to DataURL
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
