import { ApiKeySchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ApiRequest from '#models/api_request'

export default class ApiKey extends ApiKeySchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ApiRequest)
  declare requests: HasMany<typeof ApiRequest>

  get maskedKey() {
    return `${this.key.slice(0, 10)}${'•'.repeat(20)}${this.key.slice(-4)}`
  }
}
