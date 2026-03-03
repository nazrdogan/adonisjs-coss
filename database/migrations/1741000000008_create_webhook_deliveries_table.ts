import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webhook_deliveries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('endpoint_id')
        .unsigned()
        .references('id')
        .inTable('webhook_endpoints')
        .onDelete('CASCADE')
        .notNullable()
      table.string('event').notNullable()
      table.json('payload').notNullable()
      table.string('status').notNullable().defaultTo('pending')
      table.integer('attempts').notNullable().defaultTo(0)
      table.integer('last_response_code').nullable()
      table.text('last_error').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
