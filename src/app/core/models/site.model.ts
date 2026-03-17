export interface SiteResponse {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  totalSurfaceM2: number;
  totalEmployees: number | null;
  constructionYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteParkingInput {
  parkingTypeId: string;
  spotsCount: number;
}

export interface MaterialInput {
  label: string;
  quantity: number;
  unit: string;
  feValueAtTime: number;
}

export interface CreateSiteRequest {
  name: string;
  address: string | null;
  city: string | null;
  totalSurfaceM2: number;
  totalEmployees: number | null;
  constructionYear: number | null;
  parkings: SiteParkingInput[];
  materials: MaterialInput[];
}
