import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ApiRequest from '#models/api_request'
import { DateTime } from 'luxon'

export default class DashboardController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!

    await user.load('plan')
    await user.load('apiKeys', (q) => q.where('is_active', true).orderBy('created_at', 'asc'))

    const recentRequests = await ApiRequest.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .limit(20)
      .select(
        'id',
        'type',
        'amazon_domain',
        'asin',
        'query',
        'status',
        'response_cached',
        'credits_used',
        'error_message',
        'created_at'
      )

    // Daily usage for last 30 days
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toSQL()
    const dailyUsageRows = await db
      .from('api_requests')
      .where('user_id', user.id)
      .where('created_at', '>=', thirtyDaysAgo!)
      .select(db.raw("to_char(created_at, 'YYYY-MM-DD') as date"))
      .count('* as count')
      .groupByRaw("to_char(created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'asc')

    // Fill in missing days with 0
    const dailyUsageMap = new Map<string, number>()
    for (const row of dailyUsageRows) {
      dailyUsageMap.set(row.date, Number(row.count))
    }
    const dailyUsage: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toFormat('yyyy-MM-dd')
      dailyUsage.push({ date, count: dailyUsageMap.get(date) ?? 0 })
    }

    // Success rate
    const statusCounts = await db
      .from('api_requests')
      .where('user_id', user.id)
      .where('created_at', '>=', thirtyDaysAgo!)
      .select('status')
      .count('* as count')
      .groupBy('status')

    const statusMap: Record<string, number> = {}
    for (const row of statusCounts) {
      statusMap[row.status] = Number(row.count)
    }
    const totalRequests30d = Object.values(statusMap).reduce((a, b) => a + b, 0)
    const successRate = totalRequests30d > 0
      ? Math.round(((statusMap['success'] ?? 0) / totalRequests30d) * 100)
      : 100

    const plan = user.plan ?? { name: 'Free Trial', requestLimit: 100, slug: 'free' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return inertia.render('dashboard/index' as any, {
      apiKeys: user.apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        key: k.key,
        maskedKey: k.maskedKey,
        isActive: k.isActive,
        lastUsedAt: k.lastUsedAt?.toISO() ?? null,
        createdAt: k.createdAt.toISO(),
      })),
      plan: {
        name: plan.name,
        slug: plan.slug,
        requestLimit: plan.requestLimit,
      },
      monthlyUsage: user.monthlyRequestsUsed,
      dailyUsage,
      successRate,
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        type: r.type,
        amazonDomain: r.amazonDomain,
        asin: r.asin,
        query: r.query,
        status: r.status as 'success' | 'error' | 'pending',
        responseCached: r.responseCached,
        creditsUsed: r.creditsUsed,
        errorMessage: r.errorMessage,
        createdAt: r.createdAt.toISO(),
      })),
    })
  }

  async playground({ inertia, auth }: HttpContext) {
    const user = auth.user!
    await user.load('apiKeys', (q) => q.where('is_active', true).orderBy('created_at', 'asc'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return inertia.render('dashboard/playground' as any, {
      apiKeys: user.apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        key: k.key,
        maskedKey: k.maskedKey,
      })),
    })
  }

  async docs({ inertia }: HttpContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return inertia.render('dashboard/docs' as any, {})
  }
}
