import * as cheerio from 'cheerio'

export interface CategoryProduct {
  position: number
  asin: string
  title: string
  link: string
  image: string | null
  price: number | null
  currency: string
  rating: number | null
  ratings_total: number | null
  is_prime: boolean
  is_sponsored: boolean
}

export interface CategoryPageResult {
  browse_node_id: string
  current_page: number
  results: CategoryProduct[]
}

export function parseCategoryPage(
  html: string,
  browseNodeId: string,
  domain: string,
  page: number
): CategoryPageResult {
  const $ = cheerio.load(html)
  const results: CategoryProduct[] = []

  $('[data-component-type="s-search-result"][data-asin]').each((idx, el) => {
    const asin = $(el).attr('data-asin')
    if (!asin) return

    const title = $(el).find('h2 a span').text().trim()
    const href = $(el).find('h2 a').attr('href')
    const link = href
      ? `https://www.${domain}${href.split('?')[0]}`
      : `https://www.${domain}/dp/${asin}`

    const image = $(el).find('.s-image').attr('src') ?? null

    const priceRaw = $(el).find('.a-price .a-offscreen').first().text().trim()
    const priceMatch = priceRaw.match(/[\d,.]+/)
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null
    const currency = priceRaw.match(/[^\d\s,.]+/)?.[0] ?? '$'

    const ratingText = $(el).find('.a-icon-alt').first().text()
    const ratingMatch = ratingText.match(/[\d.]+/)
    const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null

    const reviewText = $(el).find('.s-underline-link-text .a-size-base').first().text()
    const reviewMatch = reviewText.match(/[\d,]+/)
    const ratings_total = reviewMatch ? parseInt(reviewMatch[0].replace(/,/g, '')) : null

    const is_prime = $(el).find('.s-prime .a-icon-prime').length > 0
    const is_sponsored =
      $(el).find('.s-sponsored-label-info-icon, [aria-label*="Sponsored"]').length > 0

    results.push({
      position: idx + 1,
      asin,
      title,
      link,
      image,
      price,
      currency,
      rating,
      ratings_total,
      is_prime,
      is_sponsored,
    })
  })

  return { browse_node_id: browseNodeId, current_page: page, results }
}
