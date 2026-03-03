import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.integer('price_monthly').notNullable().defaultTo(0) // in cents
      table.integer('request_limit').notNullable().defaultTo(100)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // defer runs AFTER schema DDL is executed
    this.defer(async (db) => {
      await db.table('plans').multiInsert([
        {
          name: 'Free Trial',
          slug: 'free',
          price_monthly: 0,
          request_limit: 100,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Starter',
          slug: 'starter',
          price_monthly: 2900,
          request_limit: 5000,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Growth',
          slug: 'growth',
          price_monthly: 9900,
          request_limit: 50000,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Pro',
          slug: 'pro',
          price_monthly: 29900,
          request_limit: 500000,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
