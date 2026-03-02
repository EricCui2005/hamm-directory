export interface Alumni {
  id: string;
  name: string;
  email: string;
  linkedin_url: string | null;
  year_start: number;
  year_end: number;
  created_at: string;
}

export type AlumniInsert = Omit<Alumni, 'id' | 'created_at'>;
export type AlumniUpdate = Partial<AlumniInsert>;
