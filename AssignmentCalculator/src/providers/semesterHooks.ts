// React hooks for semester data using TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSemesters, getSemester, createSemester, deleteSemester } from '../services/semesters';
import type { Semester } from '../services/semesters';

const LIST_KEY = ['semesters'] as const;
const DETAIL_KEY = (id: string) => ['semester', id] as const;

/**
 * Fetch all semesters from backend
 * Cached for 10 minutes to reduce backend load
 */
export function useSemesters() {
  return useQuery<Semester[]>({
    queryKey: LIST_KEY,
    queryFn: getSemesters,
    staleTime: 10 * 60_000, // 10 minutes - semesters change infrequently
  });
}

/**
 * Fetch a single semester by ID
 */
export function useSemester(id: string | undefined) {
  return useQuery<Semester>({
    queryKey: id ? DETAIL_KEY(id) : LIST_KEY,
    queryFn: () => getSemester(id!),
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
  });
}

/**
 * Create a new semester
 * Invalidates list cache on success
 */
export function useCreateSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSemester,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Delete a semester
 * Removes from cache on success
 */
export function useDeleteSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSemester,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.removeQueries({ queryKey: DETAIL_KEY(id) });
    },
  });
}
