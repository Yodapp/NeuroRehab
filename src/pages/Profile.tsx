import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserProfile } from '@/types'

const protocolLabels: Record<string, string> = {
  stamets_4_3: 'Stamets 4:3',
  onward_5_2: 'Experience Onward 5:2',
  none: 'None',
}

const supplementLabels: Record<string, string> = {
  psilocybin: 'Psilocybin',
  niacin: 'Niacin B3',
  lions_mane: "Lion's Mane",
  morning_meds: 'Morning Medication',
}

interface ProfileProps {
  profile: UserProfile
  onEditSettings: () => void
}

export function Profile({ profile, onEditSettings }: ProfileProps) {
  const { signOut, user } = useAuth()
  const [activityNames, setActivityNames] = useState<string[]>([])
  const [intention, setIntention] = useState(profile.intention ?? '')
  const [savingIntention, setSavingIntention] = useState(false)
  const [savedIntention, setSavedIntention] = useState(false)

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
    : `${activityNames.slice(0, 3).join(', ')} (+${activityNames.length - 3} more)`

  async function handleSaveIntention() {
    if (!user) return
    setSavingIntention(true)
    await supabase
      .from('profiles')
      .update({ intention: intention.trim() || null })
      .eq('id', user.id)
    setSavingIntention(false)
    setSavedIntention(true)
    setTimeout(() => setSavedIntention(false), 2000)
  }

  const intentionChanged = intention.trim() !== (profile.intention ?? '').trim()

  return (
    <div className="flex flex-col gap-6 p-5 pb-32">
      <h1 className="text-title">Profile</h1>

      <div className="flex flex-col gap-4 rounded-[14px] border border-border-subtle bg-bg-card p-4">
        <div>
          <p className="text-meta text-text-secondary">Protocol</p>
          <p className="text-body font-medium text-text-primary">
            {protocolLabels[profile.protocol_type] ?? profile.protocol_type}
            {profile.protocol_start_date && (
              <span className="text-text-secondary">
                {' '}(start: {new Date(profile.protocol_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-meta text-text-secondary">Supplements</p>
          <p className="text-body font-medium text-text-primary">{supplementsList || 'None'}</p>
        </div>

        <div>
          <p className="text-meta text-text-secondary">Activities</p>
          <p className="text-body font-medium text-text-primary">{activitiesDisplay || 'None'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] border border-border-subtle bg-bg-card p-4">
        <div>
          <p className="text-meta text-text-secondary">Intention</p>
          <p className="text-xs text-text-secondary">A short mantra shown at the top of Today. Optional.</p>
        </div>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="e.g. Progress, not perfection."
          maxLength={160}
          rows={2}
          className="w-full resize-none rounded-[14px] border border-border-subtle bg-bg-inactive px-3 py-2 text-body text-text-primary placeholder:text-text-disabled"
        />
        <Button
          size="sm"
          variant="outline"
          className="self-end rounded-[14px] text-button text-accent-blue border-border-subtle"
          onClick={handleSaveIntention}
          disabled={savingIntention || !intentionChanged}
        >
          {savedIntention ? 'Saved' : 'Save'}
        </Button>
      </div>

      <p className="text-xs text-text-secondary">
        Microdosing is not a replacement for professional mental health support. Consult a licensed healthcare provider before beginning, especially if you take psychiatric medications or have underlying health conditions.
      </p>

      <Button
        variant="outline"
        className="min-h-[50px] rounded-[14px] text-button text-accent-blue border-border-subtle"
        onClick={onEditSettings}
      >
        Edit Settings
      </Button>

      <Button
        variant="destructive"
        className="min-h-[50px] rounded-[14px] text-button bg-accent-red"
        onClick={signOut}
      >
        Sign Out
      </Button>
    </div>
  )
}
