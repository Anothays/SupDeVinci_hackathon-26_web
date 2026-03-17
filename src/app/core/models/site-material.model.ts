export interface SiteMaterialResponse {
  id: string;
  siteId: string;
  materialTypeId: string;
  materialTypeCode: string;
  materialTypeName: string;
  quantity: number;
}

export interface CreateSiteMaterialRequest {
  materialTypeId: string;
  quantity: number;
}
