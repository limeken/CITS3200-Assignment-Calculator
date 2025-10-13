import { http } from '../providers/client';
import type {
  AssignmentTypeSummary,
  AssignmentTypeDetail,
  AssignmentTypeInput,
} from '../types/assignmentTypes';

export const getAssignmentTypes = () =>
  http<AssignmentTypeSummary[]>('/types');

export const getAssignmentType = (id: string) =>
  http<AssignmentTypeDetail>(`/types/${encodeURIComponent(id)}`);

export const createAssignmentType = (input: AssignmentTypeInput) =>
  http<AssignmentTypeDetail>('/types', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateAssignmentType = (id: string, input: AssignmentTypeInput) =>
  http<AssignmentTypeDetail>(`/types/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

export const deleteAssignmentType = (id: string) =>
  http<void>(`/types/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const getAssignmentTypesMetadata = () =>
  http<{ generated_at: string | null }>('/types/metadata');
