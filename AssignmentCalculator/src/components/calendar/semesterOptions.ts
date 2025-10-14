import { createSemester, type Semester as CalendarSemester } from './CalendarTypes.ts';
import type { Semester as BackendSemester } from '../../services/semesters.ts';

export type SemesterOptionSource = 'backend' | 'fallback';

export interface SemesterOption {
  id: string;
  name: string;
  semester: CalendarSemester;
  source: SemesterOptionSource;
}

const createFallbackOption = (
  id: string,
  name: string,
  start: string,
  end: string,
): SemesterOption => {
  const semester = createSemester(new Date(start), new Date(end));
  return { id, name, semester, source: 'fallback' };
};

export const FALLBACK_SEMESTER_OPTIONS: SemesterOption[] = [
  createFallbackOption('fallback-semester-1', 'Semester 1', '2025-02-24', '2025-05-23'),
  createFallbackOption('fallback-semester-2', 'Semester 2', '2025-07-21', '2025-10-17'),
  createFallbackOption('fallback-trimester-1', 'Trimester 1', '2025-01-20', '2025-04-11'),
  createFallbackOption('fallback-trimester-2', 'Trimester 2', '2025-04-28', '2025-07-18'),
  createFallbackOption('fallback-trimester-3', 'Trimester 3', '2025-08-11', '2025-10-31'),
];

export const mapBackendSemesterToOption = (
  backend: BackendSemester,
): SemesterOption => {
  const semester = createSemester(
    new Date(backend.start_date),
    new Date(backend.end_date),
  );

  if (backend.detail) {
    semester.detail = backend.detail;
  }

  return {
    id: backend.id,
    name: backend.name,
    semester,
    source: 'backend',
  };
};

export const buildSemesterOptions = (
  backendSemesters: BackendSemester[] | undefined,
): SemesterOption[] => {
  if (backendSemesters && backendSemesters.length > 0) {
    return backendSemesters.map(mapBackendSemesterToOption);
  }
  return FALLBACK_SEMESTER_OPTIONS;
};

export const findSemesterOption = (
  options: SemesterOption[],
  id: string | number | undefined,
): SemesterOption | undefined => {
  if (id === undefined) return undefined;
  const normalized = String(id);
  return options.find((option) => String(option.id) === normalized);
};
