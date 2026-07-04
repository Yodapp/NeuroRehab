import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

import { BottomNav } from '@/components/BottomNav'
import { OnboardingWizard } from '@/components/OnboardingWizard'
import { Button } from '@/components/ui/button'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Login } from '@/pages/Login'
import { Profile } from '@/pages/Profile'
import { Today } from '@/pages/Today'
import { Week } from '@/pages/Week'
import type { UserProfile } from '@/types'

function AppContent() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const [editingSettings, setEditingSettings] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError(false)
      return
    }

    setProfileLoading(true)
    setProfileError(false)

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setProfileError(true)
        } else {
          setProfile(data)
        }
        setProfileLoading(false)
      })
  }, [user, retryCount])

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-green border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Login />

  if (profileError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-primary p-5 text-center text-text-primary">
        <p className="text-body text-text-secondary">Couldn't load your profile. Check your connection and try again.</p>
        <Button variant="outline" className="border-border-subtle text-accent-blue" onClick={() => setRetryCount((c) => c + 1)}>
          Retry
        </Button>
      </div>
    )
  }

  if (!profile?.onboarding_completed) {
    return (
      <OnboardingWizard
        onComplete={async () => {
          const { data } = await supabase
            .from('profiles').select('*').eq('id', user.id).single()
          if (data) setProfile(data)
        }}
      />
    )
  }

  if (editingSettings) {
    return (
      <OnboardingWizard
        initialValues={profile}
        onComplete={async () => {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (data) setProfile(data)
          setEditingSettings(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary">
      <main className="pb-[100px]">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/week" element={<Week />} />
          <Route
            path="/profile"
            element={
              <Profile
                profile={profile}
                onEditSettings={() => setEditingSettings(true)}
              />
            }
          />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
