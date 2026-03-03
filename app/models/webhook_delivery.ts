import { WebhookDeliverySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WebhookEndpoint from '#models/webhook_endpoint'

export default class WebhookDelivery extends WebhookDeliverySchema {
  @belongsTo(() => WebhookEndpoint, { foreignKey: 'endpointId' })
  declare endpoint: BelongsTo<typeof WebhookEndpoint>
}
