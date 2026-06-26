import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { BottomNav } from '@/components/BottomNav'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Log } from '@/pages/Log'
import { Login } from '@/pages/Login'
import { Profile } from '@/pages/Profile'
import { Today } from '@/pages/Today'
import { Week } from '@/pages/Week'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/log" element={<Log />} />
          <Route path="/week" element={<Week />} />
          <Route path="/profile" element={<Profile />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
