import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function Profile() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-dvh px-4 py-6">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <div className="mt-8">
        <Button variant="destructive" onClick={signOut}>
          Logga ut
        </Button>
      </div>
    </div>
  )
}
