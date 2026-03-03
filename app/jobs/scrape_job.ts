import { Job } from '@rlanz/bull-queue'
import type { ScraperParams } from '#services/scraper_service'

export interface ScrapeJobPayload {
  params: ScraperParams
  logEntryId: number
  userId: number
}

export default class ScrapeJob extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  async handle(payload: ScrapeJobPayload) {
    const { ScraperService } = await import('#services/scraper_service')
    const { default: ApiRequest } = await import('#models/api_request')
    const { default: User } = await import('#models/user')
    const { default: redis } = await import('@adonisjs/redis/services/main')

    const { params, logEntryId, userId } = payload
    const jobId = this.getId()

    const scraper = new ScraperService()
    const result = await scraper.scrape(params)

    // Update log entry
    const logEntry = await ApiRequest.find(logEntryId)
    if (logEntry) {
      await logEntry.merge({ status: 'success', responseCached: result.cached }).save()
    }

    // Increment monthly usage
    const user = await User.find(userId)
    if (user) {
      await user.merge({ monthlyRequestsUsed: user.monthlyRequestsUsed + 1 }).save()
    }

    // Store result in Redis for polling (TTL 10 minutes)
    await redis.set(`job_result:${jobId}`, JSON.stringify({ success: true, data: result }), 'EX', 600)
  }

  async rescue(payload: ScrapeJobPayload, error: Error) {
    const { default: ApiRequest } = await import('#models/api_request')
    const { default: redis } = await import('@adonisjs/redis/services/main')

    const { logEntryId } = payload
    const jobId = this.getId()
    const message = error.message || 'Unknown scraping error'

    const logEntry = await ApiRequest.find(logEntryId)
    if (logEntry) {
      await logEntry.merge({ status: 'error', errorMessage: message }).save()
    }

    await redis.set(
      `job_result:${jobId}`,
      JSON.stringify({ success: false, error: message }),
      'EX',
      600
    )
  }
}
