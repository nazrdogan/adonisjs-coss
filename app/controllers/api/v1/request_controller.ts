import type { HttpContext } from '@adonisjs/core/http'
import { ScraperService, type RequestType } from '#services/scraper_service'
import { apiRequestValidator } from '#validators/api_request'
import ApiRequest from '#models/api_request'
import queue from '@rlanz/bull-queue/services/main'
import ScrapeJob from '#jobs/scrape_job'

function validationError(response: HttpContext['response'], error: string, message: string) {
  return response.status(422).json({
    request_info: { success: false },
    request_metadata: { error, message },
  })
}

export default class RequestController {
  async handle({ request, response, apiKey, apiUser }: HttpContext) {
    // Validate with VineJS
    let data: Awaited<ReturnType<typeof apiRequestValidator.validate>>
    try {
      data = await apiRequestValidator.validate(request.qs())
    } catch (err: any) {
      const messages = err.messages ?? []
      const first = messages[0]
      return validationError(
        response,
        'validation_error',
        first ? `${first.field}: ${first.message}` : 'Invalid request parameters'
      )
    }

    const type = data.type as RequestType
    const amazonDomain = data.amazon_domain ?? 'amazon.com'
    const page = data.page ?? 1
    const isAsync = data.async === 'true'

    // Validate required params per type
    if (
      (type === 'product' || type === 'reviews' || type === 'offers' || type === 'questions') &&
      !data.asin
    ) {
      return validationError(response, 'missing_asin', `asin is required for type=${type}`)
    }

    if (type === 'search' && !data.search_term) {
      return validationError(response, 'missing_search_term', 'search_term is required for type=search')
    }

    if (type === 'category' && !data.browse_node_id) {
      return validationError(response, 'missing_browse_node_id', 'browse_node_id is required for type=category')
    }

    if (type === 'seller' && !data.seller_id) {
      return validationError(response, 'missing_seller_id', 'seller_id is required for type=seller')
    }

    const scraperParams = {
      type,
      asin: data.asin,
      search_term: data.search_term,
      amazon_domain: amazonDomain,
      page,
      browse_node_id: data.browse_node_id,
      category: data.category,
      seller_id: data.seller_id,
    }

    // Log the request (as pending)
    const logEntry = await ApiRequest.create({
      userId: apiUser.id,
      apiKeyId: apiKey.id,
      type,
      amazonDomain,
      asin: data.asin ?? null,
      query: data.search_term ?? null,
      status: 'pending',
      creditsUsed: 1,
    })

    // Async mode: queue the job and return immediately
    if (isAsync) {
      const job = await queue.dispatch(ScrapeJob, {
        params: scraperParams,
        logEntryId: logEntry.id,
        userId: apiUser.id,
      })

      await apiUser.merge({ monthlyRequestsUsed: apiUser.monthlyRequestsUsed + 1 }).save()

      return response.status(202).json({
        request_info: { success: true, status: 'queued' },
        request_id: job.id,
        poll_url: `/api/v1/result/${job.id}`,
        message: 'Request queued. Poll the poll_url to get the result.',
      })
    }

    // Sync mode: scrape inline
    try {
      const scraper = new ScraperService()
      const result = await scraper.scrape(scraperParams)

      await logEntry.merge({ status: 'success', responseCached: result.cached }).save()
      await apiUser.merge({ monthlyRequestsUsed: apiUser.monthlyRequestsUsed + 1 }).save()

      return response.json({
        request_info: { success: true, ...result.request_info },
        ...Object.fromEntries(
          Object.entries(result).filter(([k]) => k !== 'request_info' && k !== 'cached')
        ),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown scraping error'
      await logEntry.merge({ status: 'error', errorMessage: message }).save()

      return response.status(502).json({
        request_info: { success: false },
        request_metadata: { error: 'scraping_failed', message },
      })
    }
  }
}
