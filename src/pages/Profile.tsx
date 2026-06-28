import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserProfile } from '@/types'

const protocolLabels: Record<string, string> = {
  stamets_4_3: 'Stamets 4:3',
  onward_5_2: 'Experience Onward 5:2',
  none: 'Ingen',
}

const supplementLabels: Record<string, string> = {
  psilocybin: 'Psilocybin',
  niacin: 'Niacin B3',
  lions_mane: "Lion's Mane",
  morning_meds: 'Morgonmedicin',
}

interface ProfileProps {
  profile: UserProfile
  onEditSettings: () => void
}

export function Profile({ profile, onEditSettings }: ProfileProps) {
  const { signOut, user } = useAuth()
  const [activityNames, setActivityNames] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_activities')
      .select('activities(name)')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .then(({ data }) => {
        if (data) {
          setActivityNames(data.map((r: any) => r.activities?.name).filter(Boolean))
        }
      })
  }, [user])

  const supplementsList = profile.enabled_supplements
    .map((s) => supplementLabels[s] || s)
    .join(', ')

  const activitiesDisplay = activityNames.length <= 3
    ? activityNames.join(', ')
    : `${activityNames.slice(0, 3).join(', ')} (+${activityNames.length - 3} till)`

  return (
    <div className="flex flex-col gap-6 p-5 pb-32">
      <h1 className="text-title">Profil</h1>

      <div className="flex flex-col gap-4 rounded-[14px] border border-border-subtle bg-bg-card p-4">
        <div>
          <p className="text-meta text-text-secondary">Protokoll</p>
          <p className="text-body font-medium text-text-primary">
            {protocolLabels[profile.protocol_type] ?? profile.protocol_type}
            {profile.protocol_start_date && (
              <span className="text-text-secondary">
                {' '}(start: {new Date(profile.protocol_start_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })})
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-meta text-text-secondary">Tillskott</p>
          <p className="text-body font-medium text-text-primary">{supplementsList || 'Inga'}</p>
        </div>

        <div>
          <p className="text-meta text-text-secondary">Aktiviteter</p>
          <p className="text-body font-medium text-text-primary">{activitiesDisplay || 'Inga'}</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="min-h-[50px] rounded-[14px] text-button text-accent-blue border-border-subtle"
        onClick={onEditSettings}
      >
        Ändra inställningar
      </Button>

      <Button
        variant="destructive"
        className="min-h-[50px] rounded-[14px] text-button bg-accent-red"
        onClick={signOut}
      >
        Logga ut
      </Button>
    </div>
  )
}
