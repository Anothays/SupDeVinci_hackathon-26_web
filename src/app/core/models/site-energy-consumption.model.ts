import { EnergySource } from './energy-emission-factor.model';

export interface SiteEnergyConsumptionResponse {
  id: string;
  siteId: string;
  year: number;
  source: EnergySource;
  consumptionMwh: number;
}

export interface CreateSiteEnergyConsumptionRequest {
  year: number;
  source: EnergySource;
  consumptionMwh: number;
}
