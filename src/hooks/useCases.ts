import { useQuery } from '@tanstack/react-query'
import { casesApi } from '@/api'
import type { CaseResponse } from '@/types'

export function useCases() {
    return useQuery<CaseResponse[]>({
        queryKey: ['cases'],
        queryFn: async () => {
            const res = await casesApi.getMyCases()

            if (!res.data.success) {
                throw new Error(
                    res.data.error ?? 'Failed to load cases'
                )
            }

            return res.data.data ?? []
        },
        staleTime: 5 * 60 * 1000,
    })
}