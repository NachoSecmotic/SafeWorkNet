export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface Section {
  name: string;
  aiModels: string[];
  coordinates: number[][];
}
