import Stripe from 'stripe'
import stripeConfig from '#config/stripe'
import User from '#models/user'
import Plan from '#models/plan'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!stripeConfig.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(stripeConfig.secretKey)
  }
  return stripeInstance
}

export class StripeService {
  private stripe = getStripe()

  async getOrCreateCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.fullName ?? undefined,
      metadata: { user_id: String(user.id) },
    })

    await user.merge({ stripeCustomerId: customer.id }).save()
    return customer.id
  }

  async createCheckoutSession(user: User, plan: Plan): Promise<string> {
    if (!plan.stripePriceId) {
      throw new Error(`Plan "${plan.name}" has no Stripe price ID configured`)
    }

    const customerId = await this.getOrCreateCustomer(user)

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${stripeConfig.returnUrl}?billing=success`,
      cancel_url: `${stripeConfig.cancelUrl}?billing=cancelled`,
      metadata: {
        user_id: String(user.id),
        plan_id: String(plan.id),
      },
    })

    return session.url!
  }

  async createPortalSession(user: User): Promise<string> {
    const customerId = await this.getOrCreateCustomer(user)

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: stripeConfig.returnUrl,
    })

    return session.url
  }

  async handleWebhookEvent(rawBody: string, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeConfig.webhookSecret
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const planId = session.metadata?.plan_id

    if (!userId || !planId) return

    const user = await User.find(Number(userId))
    if (!user) return

    await user.merge({
      planId: Number(planId),
      stripeSubscriptionId: session.subscription as string,
    }).save()
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const user = await User.findBy('stripeCustomerId', subscription.customer as string)
    if (!user) return

    const priceId = subscription.items.data[0]?.price?.id
    if (!priceId) return

    const plan = await Plan.findBy('stripePriceId', priceId)
    if (plan) {
      await user.merge({
        planId: plan.id,
        stripeSubscriptionId: subscription.id,
      }).save()
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const user = await User.findBy('stripeCustomerId', subscription.customer as string)
    if (!user) return

    // Revert to free plan
    const freePlan = await Plan.findBy('slug', 'free')
    await user.merge({
      planId: freePlan?.id ?? null,
      stripeSubscriptionId: null,
    }).save()
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Could send notification — for now just log
    const customerId = invoice.customer as string
    const user = await User.findBy('stripeCustomerId', customerId)
    if (user) {
      console.warn(`[Stripe] Payment failed for user ${user.id} (${user.email})`)
    }
  }
}
