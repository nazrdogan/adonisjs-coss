import axios from 'axios'
import { parseProductPage } from '#services/amazon/product_scraper'
import { parseSearchPage } from '#services/amazon/search_scraper'
import { parseReviewsPage } from '#services/amazon/reviews_scraper'
import { parseOffersPage } from '#services/amazon/offers_scraper'
import { parseCategoryPage } from '#services/amazon/category_scraper'
import { parseBestsellersPage } from '#services/amazon/bestsellers_scraper'
import { parseDealsPage } from '#services/amazon/deals_scraper'
import { parseQuestionsPage } from '#services/amazon/questions_scraper'
import { parseSellerPage } from '#services/amazon/seller_scraper'
import { CacheService } from '#services/cache_service'
import { GeoTargetingService } from '#services/geo_targeting_service'
import { CaptchaService } from '#services/captcha_service'
import { BrowserPoolService } from '#services/browser_pool_service'

export type RequestType =
  | 'product'
  | 'search'
  | 'reviews'
  | 'offers'
  | 'category'
  | 'bestsellers'
  | 'deals'
  | 'questions'
  | 'seller'

export interface ScraperParams {
  type: RequestType
  asin?: string
  search_term?: string
  amazon_domain?: string
  page?: number
  browse_node_id?: string
  category?: string
  seller_id?: string
  country?: string
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
]

// Types that benefit from Playwright (JS-rendered content)
const PLAYWRIGHT_PREFERRED_TYPES: RequestType[] = ['offers', 'deals']

// Content validation markers per type
const CONTENT_MARKERS: Record<RequestType, string[]> = {
  product: ['#productTitle', 'id="productTitle"', 'id="title"'],
  search: ['data-component-type="s-search-result"', 's-result-item'],
  reviews: ['data-hook="review"', 'review-body'],
  offers: ['aod-offer', 'pinned-offer'],
  category: ['data-component-type="s-search-result"', 's-result-item'],
  bestsellers: ['gridItemRoot', 'zg-item'],
  deals: ['deal-card', 'dealCard'],
  questions: ['askTeaserQuestions', 'a-section ask-questions'],
  seller: ['seller-name', 'seller-profile'],
}

const MAX_RETRIES = 3
const BACKOFF_MS = [1000, 2000, 4000]

export interface ScrapeResult {
  request_info: Record<string, unknown>
  cached: boolean
  [key: string]: unknown
}

// Singleton browser pool shared across requests
let browserPool: BrowserPoolService | null = null

function getBrowserPool(): BrowserPoolService {
  if (!browserPool) {
    browserPool = new BrowserPoolService()
  }
  return browserPool
}

export class ScraperService {
  private cache = new CacheService()
  private geo = new GeoTargetingService()
  private captcha = new CaptchaService()

  private randomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  }

  private isRetryable(err: unknown): boolean {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ERR_NETWORK') {
        return true
      }
      const status = err.response?.status
      if (status && status >= 500) return true
    }
    return false
  }

  private looksLikeRealContent(html: string, type: RequestType): boolean {
    const markers = CONTENT_MARKERS[type]
    if (!markers) return true
    return markers.some((marker) => html.includes(marker))
  }

  /**
   * Layered HTML fetch strategy:
   * 1. Cheerio (Axios) — fast path
   * 2. CAPTCHA detected → solve via 2Captcha → retry
   * 3. Content empty/blocked → Playwright fallback
   * 4. Playwright CAPTCHA → solve interactively
   */
  private async fetchHtml(url: string, type: RequestType, domain: string): Promise<{ html: string; method: 'cheerio' | 'playwright' }> {
    const acceptLanguage = this.geo.getAcceptLanguage(domain)
    const proxyConfig = this.geo.selectProxy(domain)
    const proxyUrl = this.geo.selectProxyUrl(domain)
    const ua = this.randomUserAgent()
    const locale = this.geo.getLocale(domain)

    const headers = {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': acceptLanguage,
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    }

    const pool = getBrowserPool()
    const usePlaywrightFirst = PLAYWRIGHT_PREFERRED_TYPES.includes(type) && pool.isEnabled

    // Step 1: Try Cheerio (Axios) unless Playwright is preferred
    if (!usePlaywrightFirst) {
      let html: string | null = null
      let lastError: unknown

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await axios.get(url, {
            timeout: 25000,
            headers,
            proxy: proxyConfig,
          })
          html = response.data as string
          break
        } catch (err) {
          lastError = err
          if (!this.isRetryable(err) || attempt === MAX_RETRIES - 1) break
          await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt]))
        }
      }

      if (html) {
        // Step 2: Check for CAPTCHA
        const captchaInfo = this.captcha.detectCaptcha(html)
        if (captchaInfo.detected) {
          if (this.captcha.isConfigured) {
            const baseUrl = `https://www.${domain}`
            const solution = await this.captcha.solveCaptcha(captchaInfo, baseUrl)
            if (solution) {
              const realHtml = await this.captcha.submitSolution(solution, captchaInfo, baseUrl, headers)
              if (realHtml) {
                return { html: realHtml, method: 'cheerio' }
              }
            }
          }
          // CAPTCHA unsolvable via API — fall through to Playwright
        } else if (this.looksLikeRealContent(html, type)) {
          return { html, method: 'cheerio' }
        }
        // Content looks empty/blocked — fall through to Playwright
      }

      // If Playwright is not available, throw with whatever we got
      if (!pool.isEnabled) {
        if (html) return { html, method: 'cheerio' }
        throw lastError ?? new Error('Failed to fetch page')
      }
    }

    // Step 3: Playwright fallback (or primary for preferred types)
    const playwrightHtml = await pool.fetchPage({
      url,
      type,
      proxyUrl,
      userAgent: ua,
      locale,
    })

    // Step 4: Check for CAPTCHA in Playwright response
    const pwCaptchaInfo = this.captcha.detectCaptcha(playwrightHtml)
    if (pwCaptchaInfo.detected && this.captcha.isConfigured) {
      const baseUrl = `https://www.${domain}`
      const solution = await this.captcha.solveCaptcha(pwCaptchaInfo, baseUrl)
      if (solution) {
        const solvedHtml = await pool.fillCaptcha(url, solution, {
          proxyUrl,
          userAgent: ua,
          locale,
        })
        return { html: solvedHtml, method: 'playwright' }
      }
    }

    return { html: playwrightHtml, method: 'playwright' }
  }

  async scrape(params: ScraperParams): Promise<ScrapeResult> {
    const domain = params.amazon_domain ?? 'amazon.com'
    const page = params.page ?? 1
    const startTime = Date.now()

    // Check cache
    const cacheKey = this.cache.buildScrapeKey(params)
    const cached = await this.cache.get<ScrapeResult>(cacheKey)
    if (cached) {
      cached.cached = true
      cached.request_info = {
        ...cached.request_info,
        time_taken_secs: ((Date.now() - startTime) / 1000).toFixed(2),
      }
      return cached
    }

    let result: ScrapeResult

    switch (params.type) {
      case 'product': {
        const url = `https://www.${domain}/dp/${params.asin}`
        const { html, method } = await this.fetchHtml(url, 'product', domain)
        const product = parseProductPage(html, params.asin!, domain)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, product }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'search': {
        const url = `https://www.${domain}/s?k=${encodeURIComponent(params.search_term!)}&page=${page}`
        const { html, method } = await this.fetchHtml(url, 'search', domain)
        const search_results = parseSearchPage(html, params.search_term!, domain, page)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, search_results }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'reviews': {
        const url = `https://www.${domain}/product-reviews/${params.asin}?pageNumber=${page}`
        const { html, method } = await this.fetchHtml(url, 'reviews', domain)
        const reviews = parseReviewsPage(html, params.asin!, domain, page)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, reviews }
        await this.cache.set(cacheKey, result, 600)
        break
      }

      case 'offers': {
        const url = `https://www.${domain}/gp/offer-listing/${params.asin}`
        const { html, method } = await this.fetchHtml(url, 'offers', domain)
        const offers = parseOffersPage(html, params.asin!, domain)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, offers }
        await this.cache.set(cacheKey, result, 120)
        break
      }

      case 'category': {
        const url = `https://www.${domain}/s?node=${params.browse_node_id}&page=${page}`
        const { html, method } = await this.fetchHtml(url, 'category', domain)
        const category_results = parseCategoryPage(html, params.browse_node_id!, domain, page)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, category_results }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'bestsellers': {
        const cat = params.category ? `/${params.category}` : ''
        const url = `https://www.${domain}/gp/bestsellers${cat}`
        const { html, method } = await this.fetchHtml(url, 'bestsellers', domain)
        const bestsellers = parseBestsellersPage(html, domain)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, bestsellers }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'deals': {
        const url = `https://www.${domain}/deals`
        const { html, method } = await this.fetchHtml(url, 'deals', domain)
        const deals = parseDealsPage(html, domain)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, deals }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'questions': {
        const url = `https://www.${domain}/ask/questions/asin/${params.asin}?pageNumber=${page}`
        const { html, method } = await this.fetchHtml(url, 'questions', domain)
        const questions = parseQuestionsPage(html, params.asin!, domain, page)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, questions }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      case 'seller': {
        const url = `https://www.${domain}/sp?seller=${params.seller_id}`
        const { html, method } = await this.fetchHtml(url, 'seller', domain)
        const seller = parseSellerPage(html, params.seller_id!, domain)
        result = { request_info: this.buildRequestInfo(params, url, startTime, method), cached: false, seller }
        await this.cache.set(cacheKey, result, 300)
        break
      }

      default:
        throw new Error(`Unsupported request type: ${params.type}`)
    }

    return result
  }

  private buildRequestInfo(params: ScraperParams, url: string, startTime: number, scrapeMethod?: string) {
    return {
      amazon_url: url,
      amazon_domain: params.amazon_domain ?? 'amazon.com',
      type: params.type,
      scrape_method: scrapeMethod ?? 'cheerio',
      time_taken_secs: ((Date.now() - startTime) / 1000).toFixed(2),
    }
  }
}

export { getBrowserPool }
