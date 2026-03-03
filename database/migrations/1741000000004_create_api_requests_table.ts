import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'api_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('api_key_id')
        .unsigned()
        .references('id')
        .inTable('api_keys')
        .onDelete('SET NULL')
        .nullable()
      table.string('type', 32).notNullable() // product, search, reviews, offers
      table.string('amazon_domain', 32).notNullable().defaultTo('amazon.com')
      table.string('asin', 16).nullable()
      table.string('query', 512).nullable()
      table.string('status', 16).notNullable().defaultTo('pending') // pending, success, error
      table.boolean('response_cached').notNullable().defaultTo(false)
      table.integer('credits_used').notNullable().defaultTo(1)
      table.text('error_message').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
