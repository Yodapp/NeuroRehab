import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { BottomNav } from '@/components/BottomNav'
import { Log } from '@/pages/Log'
import { Profile } from '@/pages/Profile'
import { Today } from '@/pages/Today'
import { Week } from '@/pages/Week'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
