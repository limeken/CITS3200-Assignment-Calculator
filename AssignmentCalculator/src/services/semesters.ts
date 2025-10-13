// Semester service - connects to backend /semesters API
import { http } from '../utils/http';

export interface Semester {
  id: string;
  name: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date: string;   // ISO date string (YYYY-MM-DD)
  detail?: string;    // Optional description
}

export const getSemesters = () =>
  http<Semester[]>('/semesters');

export const getSemester = (id: string) =>
  http<Semester>(`/semesters/${encodeURIComponent(id)}`);

export const createSemester = (semester: Omit<Semester, 'id'>) =>
  http<Semester>('/semesters', {
    method: 'POST',
    body: JSON.stringify(semester),
  });

export const deleteSemester = (id: string) =>
  http<void>(`/semesters/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
