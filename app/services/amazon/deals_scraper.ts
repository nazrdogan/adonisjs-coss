import * as cheerio from 'cheerio'

export interface Deal {
  title: string
  link: string
  image: string | null
  deal_price: number | null
  original_price: number | null
  currency: string
  discount_percent: number | null
  deal_type: string | null
}

export interface DealsResult {
  deals: Deal[]
}

export function parseDealsPage(html: string, domain: string): DealsResult {
  const $ = cheerio.load(html)
  const deals: Deal[] = []

  $('[data-testid="deal-card"], .DealCard-module, .dealTile').each((_, el) => {
    const title = $(el).find('a[aria-label], .DealContent-module__title, .dealTitle').text().trim()

    const href =
      $(el).find('a[href*="/deal/"], a[href*="/dp/"]').first().attr('href') ?? ''
    const link = href ? `https://www.${domain}${href.split('?')[0]}` : ''

    const image = $(el).find('img').first().attr('src') ?? null

    const dealPriceRaw = $(el).find('.a-price .a-offscreen').first().text().trim()
    const dealPriceMatch = dealPriceRaw.match(/[\d,.]+/)
    const deal_price = dealPriceMatch ? parseFloat(dealPriceMatch[0].replace(/,/g, '')) : null
    const currency = dealPriceRaw.match(/[^\d\s,.]+/)?.[0] ?? '$'

    const origPriceRaw = $(el).find('.a-text-price .a-offscreen, .a-price[data-a-strike]').text().trim()
    const origMatch = origPriceRaw.match(/[\d,.]+/)
    const original_price = origMatch ? parseFloat(origMatch[0].replace(/,/g, '')) : null

    const discountText = $(el).find('.savingsPercentage, .DealContent-module__discount').text().trim()
    const discountMatch = discountText.match(/(\d+)/)
    const discount_percent = discountMatch ? parseInt(discountMatch[1]) : null

    const deal_type =
      $(el).find('.DealContent-module__badgeLabel, .dealBadge').text().trim() || null

    if (title) {
      deals.push({ title, link, image, deal_price, original_price, currency, discount_percent, deal_type })
    }
  })

  return { deals }
}
