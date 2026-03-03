import React from 'react'
import { Form } from '@adonisjs/inertia/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Check, CreditCard, ArrowUpRight } from 'lucide-react'

interface PlanInfo {
  id: number
  name: string
  slug: string
  priceMonthly: number
  requestLimit: number
  stripePriceId: string | null
}

interface Props {
  currentPlan: PlanInfo | null
  plans: PlanInfo[]
  hasSubscription: boolean
  monthlyUsage: number
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['100 requests/month', 'All 9 scrape types', 'JSON + CSV output', 'Community support'],
  starter: [
    '10,000 requests/month',
    'All 9 scrape types',
    'JSON + CSV output',
    'Async mode',
    'Webhook notifications',
    'Email support',
  ],
  growth: [
    '50,000 requests/month',
    'All 9 scrape types',
    'JSON + CSV output',
    'Async mode',
    'Webhook notifications',
    'Playwright rendering',
    'Priority support',
  ],
  pro: [
    '200,000 requests/month',
    'All 9 scrape types',
    'JSON + CSV output',
    'Async mode',
    'Webhook notifications',
    'Playwright rendering',
    'CAPTCHA solving',
    'Geo-targeting',
    'Dedicated support',
  ],
}

const Billing: React.FC<Props> = ({ currentPlan, plans, hasSubscription, monthlyUsage }) => {
  const currentSlug = currentPlan?.slug ?? 'free'

  return (
    <div className="container mx-auto px-5 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Manage your subscription and plan</p>
        </div>
        {hasSubscription && (
          <Form route={'billing.portal' as any}>
            <Button variant="outline" size="sm" type="submit">
              <CreditCard className="size-4 mr-1.5" />
              Manage subscription
            </Button>
          </Form>
        )}
      </div>

      {/* Current plan summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {currentPlan
              ? `You're on the ${currentPlan.name} plan`
              : "You're on the Free plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">
                  ${currentPlan?.priceMonthly ?? 0}
                </span>
                <span className="text-neutral-500 text-sm">/month</span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                {monthlyUsage.toLocaleString()} / {(currentPlan?.requestLimit ?? 100).toLocaleString()} requests used this month
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {currentPlan?.name ?? 'Free'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentSlug
          const isUpgrade = (plan.priceMonthly ?? 0) > (currentPlan?.priceMonthly ?? 0)
          const isDowngrade = (plan.priceMonthly ?? 0) < (currentPlan?.priceMonthly ?? 0) && !isCurrent
          const features = PLAN_FEATURES[plan.slug] ?? []

          return (
            <Card
              key={plan.id}
              className={isCurrent ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-neutral-500 text-sm">/mo</span>
                </div>
                <CardDescription>
                  {plan.requestLimit.toLocaleString()} requests/month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : plan.slug === 'free' ? (
                  <Button variant="outline" className="w-full" disabled>
                    {isDowngrade ? 'Downgrade via portal' : 'Default plan'}
                  </Button>
                ) : plan.stripePriceId ? (
                  hasSubscription ? (
                    <Form route={'billing.portal' as any}>
                      <Button variant={isUpgrade ? 'default' : 'outline'} className="w-full" type="submit">
                        {isUpgrade ? 'Upgrade' : 'Change plan'}
                        <ArrowUpRight className="size-4 ml-1.5" />
                      </Button>
                    </Form>
                  ) : (
                    <Form route={'billing.checkout' as any}>
                      <input type="hidden" name="plan_id" value={plan.id} />
                      <Button variant="default" className="w-full" type="submit">
                        {isUpgrade ? 'Upgrade' : 'Subscribe'}
                        <ArrowUpRight className="size-4 ml-1.5" />
                      </Button>
                    </Form>
                  )
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Not available
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Billing
