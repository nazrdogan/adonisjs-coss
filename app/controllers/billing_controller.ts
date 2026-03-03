import type { HttpContext } from '@adonisjs/core/http'
import { StripeService } from '#services/stripe_service'
import Plan from '#models/plan'

export default class BillingController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('plan')

    const plans = await Plan.query().where('isActive', true).orderBy('priceMonthly', 'asc')

    return inertia.render('dashboard/billing' as any, {
      currentPlan: user.plan
        ? {
            id: user.plan.id,
            name: user.plan.name,
            slug: user.plan.slug,
            priceMonthly: user.plan.priceMonthly,
            requestLimit: user.plan.requestLimit,
          }
        : null,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceMonthly: p.priceMonthly,
        requestLimit: p.requestLimit,
        stripePriceId: p.stripePriceId,
      })),
      hasSubscription: !!user.stripeSubscriptionId,
      monthlyUsage: user.monthlyRequestsUsed,
    })
  }

  async checkout({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const planId = request.input('plan_id')

    const plan = await Plan.find(planId)
    if (!plan || !plan.stripePriceId) {
      session.flash('error', 'Invalid plan selected')
      return response.redirect().back()
    }

    try {
      const stripeService = new StripeService()
      const checkoutUrl = await stripeService.createCheckoutSession(user, plan)
      return response.redirect(checkoutUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session'
      session.flash('error', message)
      return response.redirect().back()
    }
  }

  async portal({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    try {
      const stripeService = new StripeService()
      const portalUrl = await stripeService.createPortalSession(user)
      return response.redirect(portalUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal'
      session.flash('error', message)
      return response.redirect().back()
    }
  }
}
