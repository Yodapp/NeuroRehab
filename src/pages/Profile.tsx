import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingWizard } from '@/components/OnboardingWizard'
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
  onProfileUpdate: (profile: UserProfile) => void
}

export function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const { signOut, user } = useAuth()
  const [showWizard, setShowWizard] = useState(false)
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
  }, [user, showWizard])

  if (showWizard) {
    return (
      <OnboardingWizard
        initialValues={profile}
        onComplete={async () => {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile.id)
            .single()
          if (data) onProfileUpdate(data)
          setShowWizard(false)
        }}
      />
    )
  }

  const supplementsList = profile.enabled_supplements
    .map((s) => supplementLabels[s] || s)
    .join(', ')

  const activitiesDisplay = activityNames.length <= 3
    ? activityNames.join(', ')
    : `${activityNames.slice(0, 3).join(', ')} (+${activityNames.length - 3} till)`

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">Profil</h1>

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Protokoll</p>
          <p className="font-medium">
            {protocolLabels[profile.protocol_type] ?? profile.protocol_type}
            {profile.protocol_start_date && (
              <span className="text-muted-foreground">
                {' '}(start: {new Date(profile.protocol_start_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })})
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Tillskott</p>
          <p className="font-medium">{supplementsList || 'Inga'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Aktiviteter</p>
          <p className="font-medium">{activitiesDisplay || 'Inga'}</p>
        </div>
      </div>

      <Button variant="outline" onClick={() => setShowWizard(true)}>
        Ändra inställningar
      </Button>

      <Button variant="destructive" onClick={signOut}>
        Logga ut
      </Button>
    </div>
  )
}
