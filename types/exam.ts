
export type PressureMode = 'Calm' | 'Realistic' | 'Brutal';

export interface Exam {
  id: string;
  title: string;
  subject?: string;
  date_time: string; // ISO string
  location?: string;
  pressure_mode: PressureMode;
  archived: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExamInput {
  title: string;
  subject?: string;
  date_time: string;
  location?: string;
  pressure_mode: PressureMode;
}

export interface UpdateExamInput extends Partial<CreateExamInput> {
  archived?: boolean;
}
