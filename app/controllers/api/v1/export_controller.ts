import type { HttpContext } from '@adonisjs/core/http'
import ApiRequest from '#models/api_request'
import { CsvService } from '#services/csv_service'

export default class ExportController {
  async requests({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const requests = await ApiRequest.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(1000)

    const csvService = new CsvService()
    const rows = requests.map((r) => ({
      id: r.id,
      type: r.type,
      amazon_domain: r.amazonDomain,
      asin: r.asin ?? '',
      query: r.query ?? '',
      status: r.status,
      cached: r.responseCached ? 'yes' : 'no',
      credits_used: r.creditsUsed,
      error: r.errorMessage ?? '',
      created_at: r.createdAt.toISO(),
    }))

    const csv = csvService.jsonToCsv(rows)

    return response
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', 'attachment; filename="emerald-requests.csv"')
      .send(csv)
  }
}
