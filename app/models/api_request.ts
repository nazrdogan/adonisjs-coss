import { ApiRequestSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ApiKey from '#models/api_key'

export default class ApiRequest extends ApiRequestSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ApiKey)
  declare apiKey: BelongsTo<typeof ApiKey>
}
