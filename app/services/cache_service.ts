import redis from '@adonisjs/redis/services/main'
import type { ScraperParams } from '#services/scraper_service'

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  buildScrapeKey(params: ScraperParams): string {
    const domain = params.amazon_domain ?? 'amazon.com'
    const page = params.page ?? 1

    switch (params.type) {
      case 'product':
        return `scrape:product:${domain}:${params.asin}`
      case 'search':
        return `scrape:search:${domain}:${params.search_term}:p${page}`
      case 'reviews':
        return `scrape:reviews:${domain}:${params.asin}:p${page}`
      case 'offers':
        return `scrape:offers:${domain}:${params.asin}`
      case 'category':
        return `scrape:category:${domain}:${params.browse_node_id}:p${page}`
      case 'bestsellers':
        return `scrape:bestsellers:${domain}:${params.category ?? 'all'}`
      case 'deals':
        return `scrape:deals:${domain}`
      case 'questions':
        return `scrape:questions:${domain}:${params.asin}:p${page}`
      case 'seller':
        return `scrape:seller:${domain}:${params.seller_id}`
      default:
        return `scrape:unknown:${JSON.stringify(params)}`
    }
  }
}
