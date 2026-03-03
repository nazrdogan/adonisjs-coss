import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('stripe_price_id').nullable()
    })

    // Seed stripe price IDs from env vars
    this.defer(async (db) => {
      const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID
      const growthPriceId = process.env.STRIPE_GROWTH_PRICE_ID
      const proPriceId = process.env.STRIPE_PRO_PRICE_ID

      if (starterPriceId) {
        await db.from(this.tableName).where('slug', 'starter').update({ stripe_price_id: starterPriceId })
      }
      if (growthPriceId) {
        await db.from(this.tableName).where('slug', 'growth').update({ stripe_price_id: growthPriceId })
      }
      if (proPriceId) {
        await db.from(this.tableName).where('slug', 'pro').update({ stripe_price_id: proPriceId })
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stripe_price_id')
    })
  }
}
