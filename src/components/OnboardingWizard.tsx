import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Activity, ActivityCategory, ProtocolType, UserProfile } from '@/types'

interface OnboardingWizardProps {
  onComplete: () => void
  initialValues?: Partial<UserProfile>
}

const categoryLabels: Record<string, string> = {
  attention_memory: 'Uppmärksamhet & Minne',
  logic_problem_solving: 'Logik & Problemlösning',
  fine_motor_focus: 'Finmotorik & Fokus',
  physical: 'Fysisk',
}

export function OnboardingWizard({ onComplete, initialValues }: OnboardingWizardProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [usesMicrodosing, setUsesMicrodosing] = useState(
    initialValues?.enabled_supplements?.includes('psilocybin') ?? false
  )
  const [protocolType, setProtocolType] = useState<ProtocolType>(
    initialValues?.protocol_type ?? 'none'
  )
  const [protocolStartDate, setProtocolStartDate] = useState(
    initialValues?.protocol_start_date ?? ''
  )
  const [enabledSupplements, setEnabledSupplements] = useState<string[]>(
    initialValues?.enabled_supplements ?? ['lions_mane', 'morning_meds']
  )
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('activities').select('*')
      if (data) {
        setAllActivities(data)
        if (!initialValues) {
          setSelectedActivityIds(data.filter((a: Activity) => a.is_default).map((a: Activity) => a.id))
        }
      }
      if (initialValues && user) {
        const { data: ua } = await supabase
          .from('user_activities')
          .select('activity_id')
          .eq('user_id', user.id)
          .eq('is_enabled', true)
        if (ua) setSelectedActivityIds(ua.map((r: any) => r.activity_id))
      }
    }
    load()
  }, [])

  const totalSteps = usesMicrodosing ? 5 : 4
  const displayStep = (() => {
    if (!usesMicrodosing && step >= 2) return step + 1
    return step
  })()

  function next() {
    if (step === 1 && !usesMicrodosing) {
      setStep(2)
    } else {
      setStep(step + 1)
    }
  }

  function back() {
    if (step === 2 && !usesMicrodosing) {
      setStep(1)
    } else {
      setStep(step - 1)
    }
  }

  function toggleSupplement(key: string) {
    setEnabledSupplements((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  function toggleActivity(id: string) {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  async function handleComplete() {
    if (!user) return
    setSaving(true)

    await supabase
      .from('profiles')
      .update({
        protocol_type: usesMicrodosing ? protocolType : 'none',
        protocol_start_date: protocolStartDate || null,
        enabled_supplements: enabledSupplements,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    await supabase.from('user_activities').delete().eq('user_id', user.id)

    if (selectedActivityIds.length > 0) {
      const rows = selectedActivityIds.map((activityId) => ({
        user_id: user.id,
        activity_id: activityId,
        is_enabled: true,
      }))
      await supabase.from('user_activities').insert(rows)
    }

    onComplete()
  }

  const actualStep = displayStep

  // Group activities by primary category
  const grouped = allActivities.reduce<Record<string, Activity[]>>((acc, a) => {
    const cat = a.categories[0] || 'physical'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg-primary px-5 py-6">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-meta text-text-secondary">Steg {step} av {totalSteps}</p>
        <div className="mt-2 h-1 rounded-full bg-bg-inactive">
          <div
            className="h-full rounded-full bg-accent-green transition-base"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {/* Step 1 — Microdosing */}
        {actualStep === 1 && (
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="text-section">Använder du psilocybin i din rehabilitering?</h2>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                variant={usesMicrodosing ? 'default' : 'outline'}
                className="h-14 text-lg"
                onClick={() => {
                  setUsesMicrodosing(true)
                  if (!enabledSupplements.includes('psilocybin')) {
                    setEnabledSupplements((s) => [...s, 'psilocybin', 'niacin'].filter((v, i, a) => a.indexOf(v) === i))
                  }
                  next()
                }}
              >
                Ja
              </Button>
              <Button
                size="lg"
                variant={!usesMicrodosing ? 'default' : 'outline'}
                className="h-14 text-lg"
                onClick={() => {
                  setUsesMicrodosing(false)
                  setProtocolType('none')
                  setProtocolStartDate('')
                  setEnabledSupplements((s) => s.filter((v) => v !== 'psilocybin' && v !== 'niacin'))
                  next()
                }}
              >
                Nej
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Protocol (only if microdosing) */}
        {actualStep === 2 && usesMicrodosing && (
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="text-section">Vilket upplägg följer du?</h2>
            <div className="flex flex-col gap-3">
              {([
                ['stamets_4_3', 'Stamets 4:3'],
                ['onward_5_2', 'Experience Onward 5:2'],
                ['none', 'Ingen fast rytm'],
              ] as [ProtocolType, string][]).map(([type, label]) => (
                <Button
                  key={type}
                  size="lg"
                  variant="outline"
                  className={`h-14 text-button ${protocolType === type ? 'border-2 border-accent-green bg-[rgba(48,209,88,0.1)]' : 'border-border-subtle bg-bg-card'}`}
                  onClick={() => setProtocolType(type)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {protocolType !== 'none' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  När startade du ditt nuvarande protokoll?
                </label>
                <input
                  type="date"
                  value={protocolStartDate}
                  onChange={(e) => setProtocolStartDate(e.target.value)}
                  className="rounded-[14px] border border-border-subtle bg-bg-card px-3 py-2 text-text-primary"
                />
              </div>
            )}

            <Button size="lg" className="mt-auto h-14 text-lg" onClick={next}>
              Nästa
            </Button>
          </div>
        )}

        {/* Step 3 — Supplements */}
        {actualStep === 3 && (
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="text-section">Vilka tillskott tar du?</h2>
            <div className="flex flex-col gap-4">
              {usesMicrodosing && (
                <label className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-bg-card p-4">
                  <span className="font-medium">Psilocybin</span>
                  <Switch
                    checked={enabledSupplements.includes('psilocybin')}
                    onCheckedChange={() => toggleSupplement('psilocybin')}
                  />
                </label>
              )}
              <label className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-bg-card p-4">
                <span className="font-medium">Niacin B3</span>
                <Switch
                  checked={enabledSupplements.includes('niacin')}
                  onCheckedChange={() => toggleSupplement('niacin')}
                />
              </label>
              <label className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-bg-card p-4">
                <span className="font-medium">Lion's Mane</span>
                <Switch
                  checked={enabledSupplements.includes('lions_mane')}
                  onCheckedChange={() => toggleSupplement('lions_mane')}
                />
              </label>
              <label className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-bg-card p-4">
                <span className="font-medium">Morgonmedicin</span>
                <Switch
                  checked={enabledSupplements.includes('morning_meds')}
                  onCheckedChange={() => toggleSupplement('morning_meds')}
                />
              </label>
            </div>
            <Button size="lg" className="mt-auto h-14 text-lg" onClick={next}>
              Nästa
            </Button>
          </div>
        )}

        {/* Step 4 — Activities */}
        {actualStep === 4 && (
          <div className="flex flex-1 flex-col gap-6">
            <div>
              <h2 className="text-section">Vad tränar du gärna?</h2>
              <p className="text-meta text-text-secondary">Välj minst en aktivitet att följa upp varje kväll.</p>
            </div>
            <div className="flex flex-col gap-6">
              {(['attention_memory', 'logic_problem_solving', 'fine_motor_focus', 'physical'] as ActivityCategory[]).map((cat) => {
                const items = grouped[cat]
                if (!items?.length) return null
                return (
                  <div key={cat}>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{categoryLabels[cat]}</h3>
                    <div className="flex flex-col gap-2">
                      {items.map((a) => (
                        <label key={a.id} className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-bg-card p-3">
                          <div>
                            <span className="font-medium">{a.name}</span>
                            {a.description && (
                              <p className="text-xs text-muted-foreground">{a.description}</p>
                            )}
                          </div>
                          <Switch
                            checked={selectedActivityIds.includes(a.id)}
                            onCheckedChange={() => toggleActivity(a.id)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              size="lg"
              className="mt-auto h-14 text-lg"
              onClick={next}
              disabled={selectedActivityIds.length === 0}
            >
              Nästa
            </Button>
          </div>
        )}

        {/* Step 5 — Done */}
        {actualStep === 5 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-title">Du är redo.</h2>
            <p className="text-body text-text-secondary">Appen är nu kalibrerad för dig.</p>
            <Button
              size="lg"
              className="h-14 w-full text-lg"
              onClick={handleComplete}
              disabled={saving}
            >
              Kom igång
            </Button>
          </div>
        )}
      </div>

      {/* Back link */}
      {step > 1 && (
        <button
          className="mt-6 text-center text-body text-accent-blue"
          onClick={back}
        >
          Tillbaka
        </button>
      )}
    </div>
  )
}
