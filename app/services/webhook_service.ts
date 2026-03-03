import crypto from 'node:crypto'
import WebhookEndpoint from '#models/webhook_endpoint'
import WebhookDelivery from '#models/webhook_delivery'

export class WebhookService {
  static generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`
  }

  static sign(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  async dispatch(userId: number, event: string, data: Record<string, unknown>): Promise<void> {
    const endpoints = await WebhookEndpoint.query()
      .where('userId', userId)
      .where('isActive', true)

    for (const endpoint of endpoints) {
      // Check if endpoint subscribes to this event
      if (!endpoint.events.includes(event)) continue

      // Create delivery record
      const delivery = await WebhookDelivery.create({
        endpointId: endpoint.id,
        event,
        payload: data,
        status: 'pending',
        attempts: 0,
      })

      // Queue the delivery (inline for simplicity — retries handled in deliverWebhook)
      this.deliverWebhook(delivery, endpoint).catch(() => {})
    }
  }

  async deliverWebhook(delivery: WebhookDelivery, endpoint: WebhookEndpoint): Promise<void> {
    const backoffDelays = [0, 5000, 30000, 120000] // immediate, 5s, 30s, 2min
    const maxAttempts = 4

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (backoffDelays[attempt] > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]))
      }

      try {
        const payload = JSON.stringify({
          event: delivery.event,
          data: delivery.payload,
          delivery_id: delivery.id,
          timestamp: new Date().toISOString(),
        })

        const signature = WebhookService.sign(payload, endpoint.secret)

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Emerald-Signature': signature,
            'X-Emerald-Event': delivery.event,
            'X-Emerald-Delivery': String(delivery.id),
          },
          body: payload,
          signal: AbortSignal.timeout(10000),
        })

        await delivery
          .merge({
            attempts: attempt + 1,
            lastResponseCode: response.status,
            status: response.ok ? 'delivered' : 'failed',
            lastError: response.ok ? null : `HTTP ${response.status}`,
          })
          .save()

        if (response.ok) return
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await delivery
          .merge({
            attempts: attempt + 1,
            status: attempt + 1 >= maxAttempts ? 'failed' : 'retrying',
            lastError: message,
          })
          .save()
      }
    }
  }
}
