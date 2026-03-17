export type ParkingType = 'SOUS_DALLE' | 'SOUS_SOL' | 'AERIEN';

export const PARKING_TYPE_LABELS: Record<ParkingType, string> = {
  SOUS_DALLE: 'Sous dalle',
  SOUS_SOL: 'Sous-sol',
  AERIEN: 'Aérien',
};

export interface SiteParkingResponse {
  id: string;
  siteId: string;
  type: ParkingType;
  count: number;
}

export interface CreateSiteParkingRequest {
  type: ParkingType;
  count: number;
}
