import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssignmentType,
  deleteAssignmentType,
  getAssignmentType,
  getAssignmentTypes,
  getAssignmentTypesMetadata,
  updateAssignmentType,
} from '../services/assignmentTypes';
import type {
  AssignmentTypeSummary,
  AssignmentTypeDetail,
  AssignmentTypeInput,
} from '../types/assignmentTypes';
import { buildAssignmentFromDetail } from '../utils/assignmentTypes';
import type { Assignment } from '../components/calendar/CalendarTypes';

const LIST_KEY = ['assignment-types'] as const;
const DETAIL_KEY = (id: string) => ['assignment-type', id] as const;
const LIBRARY_KEY = ['assignment-type-library'] as const;

type AssignmentLibrary = {
  source: 'live' | 'cache';
  generatedAt: string;
  details: AssignmentTypeDetail[];
  assignments: Assignment[];
};

async function fetchAssignmentLibrary(): Promise<AssignmentLibrary> {
  let fallback: AssignmentLibrary;

  try {
    const cacheModule = await import('../generated/cache.ts');
    fallback = {
      source: 'cache' as const,
      generatedAt: cacheModule.generatedAt,
      details: cacheModule.assignmentTypes as AssignmentTypeDetail[],
      assignments: (cacheModule.assignmentTypes as AssignmentTypeDetail[]).map((detail) =>
        buildAssignmentFromDetail(detail),
      ),
    };
  } catch (err) {
    console.error('[assignment-types] Cache file not found, using empty fallback', err);
    fallback = {
      source: 'cache',
      generatedAt: new Date().toISOString(),
      details: [],
      assignments: [],
    };
  }

  try {
    const metadata = await getAssignmentTypesMetadata();
    const backendGenerated = metadata.generated_at ?? '';
    if (!backendGenerated || backendGenerated <= fallback.generatedAt) {
      return fallback;
    }

    const summaries = await getAssignmentTypes();
    const detailRecords = await Promise.all(
      summaries.map(({ id }) => getAssignmentType(id)),
    );

    return {
      source: 'live',
      generatedAt: backendGenerated,
      details: detailRecords,
      assignments: detailRecords.map((detail) => buildAssignmentFromDetail(detail)),
    };
  } catch (error) {
    console.warn('[assignment-types] Falling back to cached data', error);
    return fallback;
  }
}

export function useAssignmentTypeLibrary() {
  return useQuery<AssignmentLibrary>({
    queryKey: LIBRARY_KEY,
    queryFn: fetchAssignmentLibrary,
    staleTime: 30_000, // 30 seconds - faster updates after admin changes
  });
}

export function useAssignmentTypes() {
  return useQuery<AssignmentTypeSummary[]>({
    queryKey: LIST_KEY,
    queryFn: getAssignmentTypes,
    staleTime: 30_000, // 30 seconds - faster updates after admin changes
  });
}

export function useAssignmentType(id: string | undefined) {
  return useQuery<AssignmentTypeDetail>({
    queryKey: id ? DETAIL_KEY(id) : LIST_KEY,
    queryFn: () => getAssignmentType(id!),
    enabled: Boolean(id),
    staleTime: 30_000, // 30 seconds - faster updates after admin changes
  });
}

export function useCreateAssignmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignmentTypeInput) => createAssignmentType(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
    },
  });
}

export function useUpdateAssignmentType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignmentTypeInput) => updateAssignmentType(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: DETAIL_KEY(id) });
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
    },
  });
}

export function useDeleteAssignmentType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAssignmentType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.removeQueries({ queryKey: DETAIL_KEY(id) });
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
    },
  });
}
