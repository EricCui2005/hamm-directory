export interface Alumni {
  id: string;
  name: string;
  email: string;
  linkedin_url: string | null;
  year_start: number;
  year_end: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export type AlumniInsert = Omit<Alumni, 'id' | 'created_at'>;
export type AlumniUpdate = Partial<AlumniInsert>;
