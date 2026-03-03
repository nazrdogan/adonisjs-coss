import * as cheerio from 'cheerio'

export interface ProductResult {
  asin: string
  title: string
  brand: string | null
  price: number | null
  currency: string
  rating: number | null
  ratings_total: number | null
  main_image: string | null
  images: string[]
  features: string[]
  description: string | null
  availability: string | null
  categories: Array<{ name: string; link: string }>
  link: string
}

export function parseProductPage(html: string, asin: string, domain: string): ProductResult {
  const $ = cheerio.load(html)

  const title = $('#productTitle').text().trim() || null

  const brand =
    $('#bylineInfo').text().trim().replace(/^(Visit the|Brand:|by)\s*/i, '').trim() || null

  const priceRaw = $('.a-price .a-offscreen').first().text().trim()
  const priceMatch = priceRaw.match(/[\d,.]+/)
  const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null

  const currency = priceRaw.match(/[^\d\s,.]+/)?.[0] ?? '$'

  const ratingText = $('#acrPopover').attr('title') || $('.a-icon-alt').first().text()
  const ratingMatch = ratingText.match(/[\d.]+/)
  const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null

  const reviewCountText = $('#acrCustomerReviewText').text().trim()
  const reviewMatch = reviewCountText.match(/[\d,]+/)
  const ratings_total = reviewMatch ? parseInt(reviewMatch[0].replace(/,/g, '')) : null

  const mainImage =
    $('#landingImage').attr('src') ||
    $('#imgTagWrapperId img').attr('src') ||
    $('#main-image').attr('src') ||
    null

  const images: string[] = []
  $('[data-action="main-image-click"] img, #altImages img').each((_, el) => {
    const src = $(el).attr('src')
    if (src && !src.includes('sprite') && !images.includes(src)) {
      images.push(src.replace(/\._[A-Z]+\d+_\./, '._SL1500_.'))
    }
  })
  if (mainImage && !images.includes(mainImage)) images.unshift(mainImage)

  const features: string[] = []
  $('#feature-bullets li span.a-list-item').each((_, el) => {
    const text = $(el).text().trim()
    if (text) features.push(text)
  })

  const description = $('#productDescription').text().trim() || null

  const availability = $('#availability span').first().text().trim() || null

  const categories: Array<{ name: string; link: string }> = []
  $('#wayfinding-breadcrumbs_feature_div li a').each((_, el) => {
    categories.push({
      name: $(el).text().trim(),
      link: `https://www.${domain}${$(el).attr('href') ?? ''}`,
    })
  })

  return {
    asin,
    title: title ?? '',
    brand,
    price,
    currency,
    rating,
    ratings_total,
    main_image: mainImage,
    images,
    features,
    description,
    availability,
    categories,
    link: `https://www.${domain}/dp/${asin}`,
  }
}
