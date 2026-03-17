export type ReportCategory =
  | 'MATERIAU_BETON'
  | 'MATERIAU_ACIEL'
  | 'MATERIAU_VERRE'
  | 'MATERIAU_BOIS'
  | 'MATERIAU_AUTRE'
  | 'ENERGIE_ELECTRICITE'
  | 'ENERGIE_GAZ'
  | 'ENERGIE_FIOUL'
  | 'ENERGIE_AUTRE'
  | 'PARKING';

export interface CarbonReportResponse {
  id: string;
  siteId: string;
  calculatedAt: string;
  referenceYear: number | null;
  constructionCo2Kg: number | null;
  exploitationCo2Kg: number | null;
  totalCo2Kg: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
  notes: string | null;
}

export interface CarbonReportDetailResponse {
  id: string;
  reportId: string;
  category: ReportCategory;
  co2Kg: number | null;
  percentage: number | null;
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  MATERIAU_BETON: 'Béton',
  MATERIAU_ACIEL: 'Acier',
  MATERIAU_VERRE: 'Verre',
  MATERIAU_BOIS: 'Bois',
  MATERIAU_AUTRE: 'Autres matériaux',
  ENERGIE_ELECTRICITE: 'Électricité',
  ENERGIE_GAZ: 'Gaz naturel',
  ENERGIE_FIOUL: 'Fioul',
  ENERGIE_AUTRE: 'Autres énergies',
  PARKING: 'Parking',
};

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  MATERIAU_BETON: '#94a3b8',
  MATERIAU_ACIEL: '#64748b',
  MATERIAU_VERRE: '#7dd3fc',
  MATERIAU_BOIS: '#86efac',
  MATERIAU_AUTRE: '#cbd5e1',
  ENERGIE_ELECTRICITE: '#fbbf24',
  ENERGIE_GAZ: '#f97316',
  ENERGIE_FIOUL: '#ef4444',
  ENERGIE_AUTRE: '#f87171',
  PARKING: '#a78bfa',
};
