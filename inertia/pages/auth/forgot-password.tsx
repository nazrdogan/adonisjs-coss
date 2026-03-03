import { Link, usePage } from '@adonisjs/inertia/react'
import { Form } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const { flash } = usePage().props as any
  const success = flash?.success as string | undefined

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
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="rounded-full bg-primary/10 size-12 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{success}</p>
            </div>
          ) : (
            <Form route={'password.forgot' as any}>
              {({ processing }) => (
                <div className="flex flex-col gap-4">
                  <Field name="email">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      type="email"
                      id="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                    <FieldError />
                  </Field>

                  <Button className="w-full mt-2" disabled={processing} type="submit">
                    Send reset link
                  </Button>
                </div>
              )}
            </Form>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link
            route="session.create"
            className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline underline-offset-4"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
