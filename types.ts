
export interface FareResult {
  transport: string;
  fare: string;
  notes: string;
  bus_names?: string[];
}

export interface FareData {
  distance_km: number;
  fares: FareResult[];
  travel_tips: string[];
}
