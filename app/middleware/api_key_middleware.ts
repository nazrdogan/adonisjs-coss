import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import redis from '@adonisjs/redis/services/main'
import ApiKey from '#models/api_key'
import User from '#models/user'
import { DateTime } from 'luxon'

const RATE_LIMITS_PER_SECOND: Record<string, number> = {
  free: 1,
  starter: 5,
  growth: 10,
  pro: 25,
}

export default class ApiKeyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    // Extract key from Authorization header or query param
    const authHeader = request.header('authorization') ?? ''
    const rawKey = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : (request.qs().api_key as string | undefined)

    if (!rawKey) {
      return response.status(401).json({
        request_info: { success: false },
        request_metadata: {
          error: 'api_key_missing',
          message:
            'No API key provided. Pass it via "Authorization: Bearer <key>" header or ?api_key=<key> query param.',
        },
      })
    }

    const apiKey = await ApiKey.query()
      .where('key', rawKey)
      .where('is_active', true)
      .preload('user', (q) => q.preload('plan'))
      .first()

    if (!apiKey) {
      return response.status(401).json({
        request_info: { success: false },
        request_metadata: {
          error: 'api_key_invalid',
          message: 'The provided API key is invalid or has been revoked.',
        },
      })
    }

    const user = apiKey.user
    const plan = user.plan

    // Check monthly request limit
    if (plan && user.monthlyRequestsUsed >= plan.requestLimit) {
      return response.status(429).json({
        request_info: { success: false },
        request_metadata: {
          error: 'monthly_limit_exceeded',
          message: `Monthly limit of ${plan.requestLimit.toLocaleString()} requests reached. Upgrade your plan to continue.`,
          requests_used: user.monthlyRequestsUsed,
          request_limit: plan.requestLimit,
        },
      })
    }

    // Per-second rate limiting via Redis
    if (plan) {
      const maxPerSecond = RATE_LIMITS_PER_SECOND[plan.slug] ?? 1
      const rateLimitKey = `ratelimit:${apiKey.id}:${Math.floor(Date.now() / 1000)}`
      const current = await redis.incr(rateLimitKey)
      if (current === 1) {
        await redis.expire(rateLimitKey, 2)
      }
      if (current > maxPerSecond) {
        return response.status(429).json({
          request_info: { success: false },
          request_metadata: {
            error: 'rate_limit_exceeded',
            message: `Per-second rate limit of ${maxPerSecond} req/s exceeded. Please slow down.`,
            retry_after_ms: 1000,
          },
        })
      }
    }

    // Attach to context for downstream controllers
    ctx.apiKey = apiKey
    ctx.apiUser = user

    // Update last_used_at (fire-and-forget, don't block the request)
    apiKey.lastUsedAt = DateTime.now()
    apiKey.save().catch(() => {})

    await next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    apiKey: ApiKey
    apiUser: User
  }
}
