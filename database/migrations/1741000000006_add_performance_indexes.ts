import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('api_requests', (table) => {
      // Dashboard queries: recent requests, daily usage chart, success rate
      // All filter by user_id + order/range on created_at
      table.index(['user_id', 'created_at'], 'idx_api_requests_user_created_at')

      // Foreign key lookup + cascading SET NULL on key deletion
      table.index(['api_key_id'], 'idx_api_requests_api_key_id')

      // Success rate aggregation grouped by status
      table.index(['status'], 'idx_api_requests_status')
    })

    this.schema.alterTable('api_keys', (table) => {
      // Dashboard: list active keys, enforce 5-key limit per user
      table.index(['user_id', 'is_active'], 'idx_api_keys_user_is_active')
    })

    this.schema.alterTable('users', (table) => {
      // Foreign key lookup for plan-based queries
      table.index(['plan_id'], 'idx_users_plan_id')

      // Email verification token lookup
      table.index(['email_verification_token'], 'idx_users_email_verification_token')
    })
  }

  async down() {
    this.schema.alterTable('api_requests', (table) => {
      table.dropIndex([], 'idx_api_requests_user_created_at')
      table.dropIndex([], 'idx_api_requests_api_key_id')
      table.dropIndex([], 'idx_api_requests_status')
    })

    this.schema.alterTable('api_keys', (table) => {
      table.dropIndex([], 'idx_api_keys_user_is_active')
    })

    this.schema.alterTable('users', (table) => {
      table.dropIndex([], 'idx_users_plan_id')
      table.dropIndex([], 'idx_users_email_verification_token')
    })
  }
}
