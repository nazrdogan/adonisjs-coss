import type { HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'
import queue from '@rlanz/bull-queue/services/main'
import { CsvService } from '#services/csv_service'

export default class ResultController {
  async handle({ params, request, response }: HttpContext) {
    const jobId = params.id as string
    const outputFormat = (request.qs().output as string) ?? 'json'

    // Check if result is stored in Redis (completed jobs)
    const cached = await redis.get(`job_result:${jobId}`)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.success) {
        const result = parsed.data
        const jsonResponse = {
          request_info: { success: true, status: 'completed', ...result.request_info },
          ...Object.fromEntries(
            Object.entries(result).filter(([k]) => k !== 'request_info' && k !== 'cached')
          ),
        }

        if (outputFormat === 'csv') {
          return this.respondCsv(response, jsonResponse, result.request_info?.type)
        }

        return response.json(jsonResponse)
      } else {
        return response.status(502).json({
          request_info: { success: false, status: 'failed' },
          request_metadata: { error: 'scraping_failed', message: parsed.error },
        })
      }
    }

    // Check if job is still in the queue via BullMQ queue instance
    const bullQueue = queue.get()

    if (!bullQueue) {
      return response.status(404).json({
        request_info: { success: false },
        request_metadata: {
          error: 'job_not_found',
          message: 'No job found with this ID. It may have expired.',
        },
      })
    }

    const job = await bullQueue.getJob(jobId)

    if (!job) {
      return response.status(404).json({
        request_info: { success: false },
        request_metadata: {
          error: 'job_not_found',
          message: 'No job found with this ID. It may have expired.',
        },
      })
    }

    const state = await job.getState()

    if (state === 'completed') {
      const result = job.returnvalue
      if (result?.success && result.data) {
        const jsonResponse = {
          request_info: { success: true, status: 'completed', ...result.data.request_info },
          ...Object.fromEntries(
            Object.entries(result.data).filter(([k]) => k !== 'request_info' && k !== 'cached')
          ),
        }

        if (outputFormat === 'csv') {
          return this.respondCsv(response, jsonResponse, result.data.request_info?.type)
        }

        return response.json(jsonResponse)
      }
      return response.status(502).json({
        request_info: { success: false, status: 'failed' },
        request_metadata: { error: 'scraping_failed', message: result?.error ?? 'Unknown error' },
      })
    }

    if (state === 'failed') {
      return response.status(502).json({
        request_info: { success: false, status: 'failed' },
        request_metadata: { error: 'scraping_failed', message: job.failedReason ?? 'Unknown error' },
      })
    }

    // Still pending or active
    return response.status(202).json({
      request_info: { success: true, status: state },
      request_id: jobId,
      poll_url: `/api/v1/result/${jobId}`,
      message: `Job is ${state}. Please poll again.`,
    })
  }

  private respondCsv(
    response: HttpContext['response'],
    jsonResponse: Record<string, unknown>,
    type?: string
  ) {
    const csvService = new CsvService()
    const dataKey = Object.keys(jsonResponse).find((k) => k !== 'request_info')
    const dataToExport = dataKey ? jsonResponse[dataKey] : jsonResponse
    const csv = csvService.jsonToCsv(dataToExport as unknown)

    return response
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="emerald-${type ?? 'result'}.csv"`)
      .send(csv)
  }
}
