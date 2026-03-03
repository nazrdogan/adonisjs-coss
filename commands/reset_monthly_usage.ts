import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class ResetMonthlyUsage extends BaseCommand {
  static commandName = 'usage:reset'
  static description = 'Reset monthly request counters for all users'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const result = await db
      .from('users')
      .update({
        monthly_requests_used: 0,
        requests_reset_at: DateTime.now().toSQL(),
      })

    this.logger.success(`Reset monthly usage for ${result[0]} users`)
  }
}
