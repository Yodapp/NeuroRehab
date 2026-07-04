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

const PROTOCOL_PRESETS = [
  { label: '4 on, 3 off', type: 'stamets_4_3' as ProtocolType, daysOn: 4, daysOff: 3 },
  { label: '5 on, 2 off', type: 'onward_5_2' as ProtocolType, daysOn: 5, daysOff: 2 },
]

const categoryLabels: Record<string, string> = {
  attention_memory: 'Attention & Memory',
  logic_problem_solving: 'Logic & Problem Solving',
  fine_motor_focus: 'Fine Motor & Focus',
  physical: 'Physical',
  mind_body: 'Mind & Presence',
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
  const [selectedDaysOn, setSelectedDaysOn] = useState(
    initialValues?.protocol_type === 'stamets_4_3' ? 4
      : initialValues?.protocol_type === 'onward_5_2' ? 5
      : 0
  )
  const [selectedDaysOff, setSelectedDaysOff] = useState(
    initialValues?.protocol_type === 'stamets_4_3' ? 3
      : initialValues?.protocol_type === 'onward_5_2' ? 2
      : 0
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

  function selectPreset(preset: typeof PROTOCOL_PRESETS[number]) {
    setProtocolType(preset.type)
    setSelectedDaysOn(preset.daysOn)
    setSelectedDaysOff(preset.daysOff)
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
    <div className="flex min-h-dvh flex-col bg-bg-primary px-5 py-6">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-meta text-text-secondary">Step {step} of {totalSteps}</p>
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
            <h2 className="text-section">Do you use psilocybin in your rehabilitation?</h2>
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
                  if (protocolType === 'none') {
                    selectPreset(PROTOCOL_PRESETS[0])
                  }
                  next()
                }}
              >
                Yes
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
                No
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Protocol (only if microdosing) */}
        {actualStep === 2 && usesMicrodosing && (
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="text-section">Which schedule do you follow?</h2>

            <div className="flex gap-2 flex-wrap">
              {PROTOCOL_PRESETS.map(preset => (
                <button
                  key={preset.type}
                  onClick={() => selectPreset(preset)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                    ${protocolType === preset.type
                      ? 'bg-accent-green/20 border-accent-green text-accent-green'
                      : 'bg-bg-card border-border-subtle text-text-secondary'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {protocolType !== 'none' && selectedDaysOn > 0 && (
              <div className="mt-4 p-3 bg-bg-card rounded-xl flex gap-6">
                <div className="flex gap-1">
                  {Array.from({ length: selectedDaysOn }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-accent-green" />
                  ))}
                  {Array.from({ length: selectedDaysOff }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-bg-inactive" />
                  ))}
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="text-text-primary font-medium">
                    {selectedDaysOn + selectedDaysOff}-day cycle
                  </span>
                  {' · '}
                  ~{Math.round(30 / (selectedDaysOn + selectedDaysOff) * selectedDaysOn)} doses/month
                </div>
              </div>
            )}

            {protocolType !== 'none' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  When did you start your current protocol?
                </label>
                <input
                  type="date"
                  value={protocolStartDate}
                  onChange={(e) => setProtocolStartDate(e.target.value)}
                  className="rounded-[14px] border border-border-subtle bg-bg-card px-3 py-2 text-text-primary"
                />
              </div>
            )}

            <Button
              size="lg"
              className="mt-auto h-14 text-lg"
              onClick={next}
              disabled={!protocolStartDate}
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 3 — Supplements */}
        {actualStep === 3 && (
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="text-section">Which supplements do you take?</h2>
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
                <span className="font-medium">Morning Medication</span>
                <Switch
                  checked={enabledSupplements.includes('morning_meds')}
                  onCheckedChange={() => toggleSupplement('morning_meds')}
                />
              </label>
            </div>
            <Button size="lg" className="mt-auto h-14 text-lg" onClick={next}>
              Next
            </Button>
          </div>
        )}

        {/* Step 4 — Activities */}
        {actualStep === 4 && (
          <div className="flex flex-1 flex-col gap-6">
            <div>
              <h2 className="text-section">What activities do you enjoy?</h2>
              <p className="text-meta text-text-secondary">Select at least one activity to track every evening.</p>
            </div>
            <div className="flex flex-col gap-6">
              {(['attention_memory', 'logic_problem_solving', 'fine_motor_focus', 'physical', 'mind_body'] as ActivityCategory[]).map((cat) => {
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
              Next
            </Button>
          </div>
        )}

        {/* Step 5 — Done */}
        {actualStep === 5 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-title">You're all set.</h2>
            <p className="text-body text-text-secondary">The app is now calibrated for you.</p>
            <Button
              size="lg"
              className="h-14 w-full text-lg"
              onClick={handleComplete}
              disabled={saving}
            >
              Get Started
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
          Back
        </button>
      )}
    </div>
  )
}
