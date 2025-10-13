import { http } from '../providers/client';
import type { SemesterDTO, SemesterInput } from '../types/semesters';

export const getSemesters = () =>
  http<SemesterDTO[]>('/semesters');

export const createSemester = (input: SemesterInput) =>
  http<SemesterDTO>('/semesters', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const deleteSemester = (id: string) =>
  http<void>(`/semesters/${encodeURIComponent(id)}`, { method: 'DELETE' });
