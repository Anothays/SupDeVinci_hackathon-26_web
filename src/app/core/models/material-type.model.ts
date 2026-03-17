export interface MaterialTypeResponse {
  id: string;
  code: string;
  name: string;
  unit: string | null;
  co2FactorKgPerUnit: number;
  source: string | null;
  description: string | null;
  updatedAt: string;
}

export interface CreateMaterialTypeRequest {
  code: string;
  name: string;
  unit: string | null;
  co2FactorKgPerUnit: number;
  source: string | null;
  description: string | null;
}
