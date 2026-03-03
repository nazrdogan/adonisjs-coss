import type { Browser, BrowserContext } from 'playwright'
import type { RequestType } from '#services/scraper_service'

const WAIT_SELECTORS: Record<RequestType, string> = {
  product: '#productTitle',
  search: '[data-component-type="s-search-result"]',
  reviews: '[data-hook="review"]',
  offers: '#aod-offer',
  category: '[data-component-type="s-search-result"]',
  bestsellers: '#gridItemRoot',
  deals: '[data-testid="deal-card"]',
  questions: '.askTeaserQuestions',
  seller: '#seller-name',
}

interface FetchPageOptions {
  url: string
  type: RequestType
  proxyUrl?: string
  userAgent?: string
  locale?: string
}

export class BrowserPoolService {
  private browser: Browser | null = null
  private activeContexts = 0
  private maxContexts: number
  private waitQueue: Array<() => void> = []
  private launching = false

  constructor() {
    this.maxContexts = Number.parseInt(process.env.PLAYWRIGHT_MAX_CONTEXTS ?? '5')
  }

  get isEnabled(): boolean {
    return process.env.PLAYWRIGHT_ENABLED !== 'false'
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser

    if (this.launching) {
      // Wait for the ongoing launch
      await new Promise<void>((resolve) => {
        const check = () => {
          if (this.browser?.isConnected()) {
            resolve()
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })
      return this.browser!
    }

    this.launching = true
    try {
      const { chromium } = await import('playwright')
      this.browser = await chromium.launch({ headless: true })
      return this.browser
    } finally {
      this.launching = false
    }
  }

  private async acquireSlot(): Promise<void> {
    if (this.activeContexts < this.maxContexts) {
      this.activeContexts++
      return
    }
    await new Promise<void>((resolve) => {
      this.waitQueue.push(resolve)
    })
    this.activeContexts++
  }

  private releaseSlot(): void {
    this.activeContexts--
    const next = this.waitQueue.shift()
    if (next) next()
  }

  async fetchPage(options: FetchPageOptions): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Playwright is disabled')
    }

    const browser = await this.ensureBrowser()
    await this.acquireSlot()

    let context: BrowserContext | null = null
    try {
      const contextOptions: Record<string, unknown> = {
        userAgent: options.userAgent,
        locale: options.locale,
        javaScriptEnabled: true,
        ignoreHTTPSErrors: true,
      }

      if (options.proxyUrl) {
        const parsed = new URL(options.proxyUrl)
        contextOptions.proxy = {
          server: `${parsed.protocol}//${parsed.hostname}:${parsed.port || '80'}`,
          username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
          password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        }
      }

      context = await browser.newContext(contextOptions)
      const page = await context.newPage()

      await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 60000 })

      // Wait for type-specific selector
      const selector = WAIT_SELECTORS[options.type]
      if (selector) {
        try {
          await page.waitForSelector(selector, { timeout: 15000 })
        } catch {
          // Selector not found; proceed with whatever loaded
        }
      }

      // Small delay for JS rendering
      await page.waitForTimeout(1000)

      return await page.content()
    } finally {
      if (context) {
        await context.close().catch(() => {})
      }
      this.releaseSlot()
    }
  }

  async fillCaptcha(
    url: string,
    solution: string,
    options: { proxyUrl?: string; userAgent?: string; locale?: string }
  ): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Playwright is disabled')
    }

    const browser = await this.ensureBrowser()
    await this.acquireSlot()

    let context: BrowserContext | null = null
    try {
      const contextOptions: Record<string, unknown> = {
        userAgent: options.userAgent,
        locale: options.locale,
        javaScriptEnabled: true,
        ignoreHTTPSErrors: true,
      }

      if (options.proxyUrl) {
        const parsed = new URL(options.proxyUrl)
        contextOptions.proxy = {
          server: `${parsed.protocol}//${parsed.hostname}:${parsed.port || '80'}`,
          username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
          password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        }
      }

      context = await browser.newContext(contextOptions)
      const page = await context.newPage()

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

      // Fill captcha input
      const captchaInput = page.locator('#captchacharacters')
      await captchaInput.fill(solution)

      // Submit the form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(1000)

      return await page.content()
    } finally {
      if (context) {
        await context.close().catch(() => {})
      }
      this.releaseSlot()
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {})
      this.browser = null
    }
  }
}
