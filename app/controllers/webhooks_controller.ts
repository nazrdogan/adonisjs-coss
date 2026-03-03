import type { HttpContext } from '@adonisjs/core/http'
import WebhookEndpoint from '#models/webhook_endpoint'
import WebhookDelivery from '#models/webhook_delivery'
import { WebhookService } from '#services/webhook_service'
import vine from '@vinejs/vine'

const createWebhookValidator = vine.create({
  url: vine.string().url().maxLength(2048),
  events: vine.array(vine.string()).minLength(1),
})

export default class WebhooksController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const endpoints = await WebhookEndpoint.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')

    const endpointIds = endpoints.map((e) => e.id)
    const deliveries = endpointIds.length > 0
      ? await WebhookDelivery.query()
          .whereIn('endpointId', endpointIds)
          .orderBy('createdAt', 'desc')
          .limit(50)
      : []

    return inertia.render('dashboard/webhooks' as any, {
      endpoints: endpoints.map((e) => ({
        id: e.id,
        url: e.url,
        secret: e.secret,
        events: e.events,
        isActive: e.isActive,
        createdAt: e.createdAt.toISO(),
      })),
      deliveries: deliveries.map((d) => ({
        id: d.id,
        endpointId: d.endpointId,
        event: d.event,
        status: d.status,
        attempts: d.attempts,
        lastResponseCode: d.lastResponseCode,
        lastError: d.lastError,
        createdAt: d.createdAt.toISO(),
      })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const data = await createWebhookValidator.validate(request.body())

    const existing = await WebhookEndpoint.query().where('userId', user.id).count('* as total')
    if (Number(existing[0].$extras.total) >= 5) {
      session.flash('error', 'Maximum 5 webhook endpoints allowed')
      return response.redirect().back()
    }

    await WebhookEndpoint.create({
      userId: user.id,
      url: data.url,
      secret: WebhookService.generateSecret(),
      events: data.events,
      isActive: true,
    })

    return response.redirect().back()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const endpoint = await WebhookEndpoint.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await endpoint.delete()
    return response.redirect().back()
  }

  async test({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const endpoint = await WebhookEndpoint.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    const webhookService = new WebhookService()
    await webhookService.dispatch(user.id, 'test', {
      message: 'This is a test webhook delivery from Emerald.',
      endpoint_id: endpoint.id,
    })

    session.flash('success', 'Test webhook sent')
    return response.redirect().back()
  }
}
