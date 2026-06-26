import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', label: 'Idag', end: true },
  { to: '/log', label: 'Logg', end: false },
  { to: '/week', label: 'Vecka', end: false },
  { to: '/profile', label: 'Profil', end: false },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background">
      <ul className="mx-auto flex max-w-lg">
        {tabs.map(({ to, label, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 items-center justify-center text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground underline underline-offset-4'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
