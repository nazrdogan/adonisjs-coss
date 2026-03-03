import * as cheerio from 'cheerio'

export interface SellerResult {
  seller_id: string
  name: string | null
  description: string | null
  rating: number | null
  ratings_total: number | null
  positive_feedback_percent: number | null
  ship_from: string | null
}

export function parseSellerPage(
  html: string,
  sellerId: string,
  _domain: string
): SellerResult {
  const $ = cheerio.load(html)

  const name =
    $('#seller-name, #sellerName, .page-header-text').first().text().trim() || null

  const description =
    $('#aboutSeller, .a-section .a-spacing-small').first().text().trim() || null

  const ratingText = $('[data-hook="seller-star-rating"] .a-icon-alt, #seller-feedback-summary .a-icon-alt')
    .first()
    .text()
  const ratingMatch = ratingText.match(/[\d.]+/)
  const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null

  const totalText = $('[data-hook="total-seller-ratings"], .a-size-base.a-link-normal').text().trim()
  const totalMatch = totalText.match(/[\d,]+/)
  const ratings_total = totalMatch ? parseInt(totalMatch[0].replace(/,/g, '')) : null

  const feedbackText = $('[data-hook="seller-positive-feedback-percentage"]').text().trim()
  const feedbackMatch = feedbackText.match(/(\d+)/)
  const positive_feedback_percent = feedbackMatch ? parseInt(feedbackMatch[1]) : null

  const ship_from =
    $('[data-hook="seller-ship-from"]').text().trim() ||
    null

  return { seller_id: sellerId, name, description, rating, ratings_total, positive_feedback_percent, ship_from }
}
