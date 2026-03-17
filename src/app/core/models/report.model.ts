import { MaterialInput } from './site.model';

export interface ReportLineResponse {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  feValueAtTime: number;
  co2e: number;
}

export interface ReportResponse {
  id: string;
  siteId: string | null;
  siteName: string | null;
  type: 'CONSTRUCTION' | 'EXPLOITATION';
  totalCo2e: number;
  co2PerM2: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  lines: ReportLineResponse[];
}

export interface CreateExploitationReportRequest {
  siteId: string;
  startDate: string;
  endDate: string;
  lines: MaterialInput[];
}
