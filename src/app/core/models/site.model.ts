export interface SiteResponse {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  city: string | null;
  totalSurfaceM2: number | null;
  employeeCount: number | null;
  workstationCount: number | null;
  constructionYear: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
