import * as cheerio from 'cheerio'

export interface BestsellerItem {
  rank: number
  asin: string | null
  title: string
  link: string
  image: string | null
  price: number | null
  currency: string
  rating: number | null
  ratings_total: number | null
}

export interface BestsellersResult {
  items: BestsellerItem[]
}

export function parseBestsellersPage(html: string, domain: string): BestsellersResult {
  const $ = cheerio.load(html)
  const items: BestsellerItem[] = []

  $('#gridItemRoot, .zg-item-immersion').each((idx, el) => {
    const rankText = $(el).find('.zg-bdg-text, .zg-badge-text').text().trim()
    const rankMatch = rankText.match(/\d+/)
    const rank = rankMatch ? parseInt(rankMatch[0]) : idx + 1

    const linkEl = $(el).find('a.a-link-normal[href*="/dp/"]').first()
    const href = linkEl.attr('href') ?? ''
    const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/)
    const asin = asinMatch ? asinMatch[1] : null

    const title =
      $(el).find('._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, .p13n-sc-truncate').text().trim() ||
      linkEl.text().trim()

    const link = href ? `https://www.${domain}${href.split('?')[0]}` : ''
    const image = $(el).find('img').attr('src') ?? null

    const priceRaw = $(el).find('.a-price .a-offscreen, ._cDEzb_p13n-sc-price_3mJ9Z').first().text().trim()
    const priceMatch = priceRaw.match(/[\d,.]+/)
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null
    const currency = priceRaw.match(/[^\d\s,.]+/)?.[0] ?? '$'

    const ratingText = $(el).find('.a-icon-alt').first().text()
    const ratingMatch = ratingText.match(/[\d.]+/)
    const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null

    const reviewText = $(el).find('.a-size-small').last().text()
    const reviewMatch = reviewText.match(/[\d,]+/)
    const ratings_total = reviewMatch ? parseInt(reviewMatch[0].replace(/,/g, '')) : null

    items.push({ rank, asin, title, link, image, price, currency, rating, ratings_total })
  })

  return { items }
}
