import { BarChart2, Sun, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', label: 'Idag', icon: Sun, end: true },
  { to: '/week', label: 'Vecka', icon: BarChart2, end: false },
  { to: '/profile', label: 'Profil', icon: User, end: false },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-bg-card"
         style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
      <ul className="mx-auto flex max-w-lg" style={{ minHeight: '83px' }}>
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium',
                  isActive
                    ? 'text-accent-green'
                    : 'text-text-secondary'
                )
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
