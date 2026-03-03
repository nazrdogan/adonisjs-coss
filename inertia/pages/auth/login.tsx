import { Link } from '@adonisjs/inertia/react'
import { Form } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { PasswordInput } from '~/components/ui/password-input'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'

export default function Login() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Form route="session.store">
            {({ processing }) => (
              <div className="flex flex-col gap-4">
                <Field name="email">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    id="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                  />
                  <FieldError />
                </Field>

                <Field name="password">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      route={'password.forgot' as any}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <FieldError />
                </Field>

                <Button className="w-full mt-2" disabled={processing} type="submit">
                  Sign in
                </Button>
              </div>
            )}
          </Form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link
            route="new_account.create"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
