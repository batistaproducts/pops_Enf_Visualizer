export type UserRole = 'standard' | 'admin';

export interface UserProfile {
  name: string;
  role: UserRole;
  coren?: string;
  selectedHospitalId: string;
}

export interface PopStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface PopItem {
  id: string;
  code: string;
  title: string;
  category: string;
  hospitalIds: string[];
  version: string;
  lastUpdated: string;
  author: string;
  revisedBy: string;
  objective: string;
  targetAudience: string;
  materials: string[];
  keywords: string[];
  steps: PopStep[];
  risks: string[];
  references: string;
  pdfUrl?: string;
  pdfFileName?: string;
  customPdfDataUrl?: string; // base64 string for uploaded/generated PDF
  isOfflineAvailable?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  city: string;
  units: string[];
  badgeColor?: string;
  isDefault?: boolean;
  totalPops?: number;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  personalToken: string;
  autoSync: boolean;
  lastSync: string;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  dataFilePath: string;
  hospitalsFilePath: string;
  errorMessage?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  hospitalId: string;
  onlyOffline: boolean;
  selectedTag: string;
}
