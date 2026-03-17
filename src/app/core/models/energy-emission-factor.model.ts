export type EnergySource = 'ELECTRICITE' | 'GAZ_NATUREL' | 'FIOUL' | 'BOIS_BIOMASSE' | 'AUTRE';

export const ENERGY_SOURCE_LABELS: Record<EnergySource, string> = {
  ELECTRICITE: 'Électricité',
  GAZ_NATUREL: 'Gaz naturel',
  FIOUL: 'Fioul',
  BOIS_BIOMASSE: 'Bois / Biomasse',
  AUTRE: 'Autre',
};

export interface EnergyEmissionFactorResponse {
  id: string;
  source: EnergySource;
  countryCode: string;
  year: number;
  factorKgCo2PerKwh: number;
  sourceName: string | null;
}

export interface CreateEnergyEmissionFactorRequest {
  source: EnergySource;
  countryCode: string;
  year: number;
  factorKgCo2PerKwh: number;
  sourceName: string | null;
}
