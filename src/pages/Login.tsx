import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (isSignUp) {
      const err = await signUp(email, password)
      if (err) {
        setError(err.message)
      } else {
        setMessage('Check your email to confirm your account')
      }
    } else {
      const err = await signIn(email, password)
      if (err) {
        setError(err.message)
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-5">
      <Card className="w-full max-w-sm rounded-[14px] border-border-subtle bg-bg-card">
        <CardHeader>
          <CardTitle className="text-section text-text-primary">
            {isSignUp ? 'Create Account' : 'Log In'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-secondary">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-[14px] border-border-subtle bg-bg-inactive text-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-secondary">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-[14px] border-border-subtle bg-bg-inactive text-text-primary"
              />
            </div>

            {error && <p className="text-meta text-accent-red">{error}</p>}
            {message && <p className="text-meta text-accent-green">{message}</p>}

            <Button
              type="submit"
              className="min-h-[50px] w-full rounded-[14px] bg-accent-blue text-button text-white"
              disabled={submitting}
            >
              {isSignUp ? 'Create Account' : 'Log In'}
            </Button>

            <button
              type="button"
              className="w-full text-center text-body text-accent-blue"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
