// zoneType.ts
export interface Unit {
  id: number;
  name: string;
}

export interface Zone {
  id: number;
  name: string;
  unitId: number;
  unitName: string; // for easy display
}
