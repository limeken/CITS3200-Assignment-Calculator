// src/data/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';

type Entity = { id: string; [k: string]: unknown };

export function useEntities() {
    return useQuery({
        queryKey: ['entities'],
        queryFn: () => http<Entity[]>('/entities'),
        staleTime: 60_000,
    });
}

export function useCreateEntity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<Entity>) =>
            http<Entity>('/entities', { method: 'POST', body: JSON.stringify(body) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['entities'] }),
    });
}

export function useEntity(id: string) {
    const { data } = useEntities();
    return data?.find(e => e.id === id);
}