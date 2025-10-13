import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSemesters, createSemester, deleteSemester } from '../services/semesters';
import type { SemesterDTO, SemesterInput } from '../types/semesters';

const LIST_KEY = ['semesters'] as const;
const DETAIL_KEY = (id: string) => ['semesters', id] as const;

export function useSemesters() {
  return useQuery<SemesterDTO[]>({
    queryKey: LIST_KEY,
    queryFn: getSemesters,
    staleTime: 10 * 60_000,
  });
}

export function useCreateSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SemesterInput) => createSemester(input),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.setQueryData<SemesterDTO | undefined>(DETAIL_KEY(saved.id), saved);
    },
  });
}

export function useDeleteSemester(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteSemester(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.removeQueries({ queryKey: DETAIL_KEY(id) });
    },
  });
}
