import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/api'
import type { CourtNotification } from '@/types'

export function useNotifications() {
    return useQuery<CourtNotification[]>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await notificationsApi.getMyNotifications()

            if (!res.data.success) {
                throw new Error(
                    res.data.error ?? 'Failed to load notifications'
                )
            }

            return res.data.data ?? []
        },
        staleTime: 60 * 1000,
    })
}