import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      role="status"
      className="w-full bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
    >
      You're offline. Changes may not save until your connection returns.
    </div>
  )
}
