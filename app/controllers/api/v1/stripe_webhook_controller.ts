import type { HttpContext } from '@adonisjs/core/http'
import { StripeService } from '#services/stripe_service'

export default class StripeWebhookController {
  async handle({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')
    if (!signature) {
      return response.status(400).json({ error: 'Missing stripe-signature header' })
    }

    const rawBody = request.raw() ?? ''

    try {
      const stripeService = new StripeService()
      await stripeService.handleWebhookEvent(rawBody, signature)
      return response.json({ received: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Webhook handling failed'
      return response.status(400).json({ error: message })
    }
  }
}
