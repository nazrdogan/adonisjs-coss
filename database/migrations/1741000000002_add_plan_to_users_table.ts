import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('plan_id').unsigned().references('id').inTable('plans').defaultTo(1).nullable()
      table.integer('monthly_requests_used').notNullable().defaultTo(0)
      table.timestamp('requests_reset_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('plan_id')
      table.dropColumn('monthly_requests_used')
      table.dropColumn('requests_reset_at')
    })
  }
}
