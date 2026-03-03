import React from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { Mail } from 'lucide-react'

interface Props {
  email: string
}

const VerifyEmail: React.FC<Props> = ({ email }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,103,79,0.06),transparent)]" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link route="home" className="flex items-center gap-2.5 mb-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L4 9h16L12 2z" fill="#6EE7B7" />
              <path d="M4 9l8 13 8-13H4z" fill="#10B981" />
              <path d="M8.5 9L12 2l3.5 7L12 22l-3.5-13z" fill="#059669" fillOpacity="0.3" />
            </svg>
            <span className="text-xl font-bold tracking-tight">emerald</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            We sent a verification link to <strong className="text-foreground">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 size-12 flex items-center justify-center">
              <Mail className="size-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to verify your account. If you don't see it, check your
              spam folder.
            </p>
            <Form route={'verification.resend' as any} className="w-full">
              <Button variant="outline" className="w-full" type="submit">
                Resend verification email
              </Button>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Wrong email?{' '}
          <Form route="session.destroy" className="inline">
            <button
              type="submit"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Log out
            </button>
          </Form>{' '}
          and sign up again.
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
