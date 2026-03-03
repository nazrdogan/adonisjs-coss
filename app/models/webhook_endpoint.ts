import { WebhookEndpointSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import WebhookDelivery from '#models/webhook_delivery'

export default class WebhookEndpoint extends WebhookEndpointSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => WebhookDelivery, { foreignKey: 'endpointId' })
  declare deliveries: HasMany<typeof WebhookDelivery>
}
