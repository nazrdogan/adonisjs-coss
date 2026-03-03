import * as cheerio from 'cheerio'

export interface Review {
  id: string | null
  title: string
  body: string
  rating: number | null
  date: string | null
  author: string | null
  verified_purchase: boolean
  helpful_votes: number
}

export interface ReviewsPageResult {
  asin: string
  current_page: number
  total_ratings: number | null
  average_rating: number | null
  reviews: Review[]
}

export function parseReviewsPage(
  html: string,
  asin: string,
  _domain: string,
  page: number
): ReviewsPageResult {
  const $ = cheerio.load(html)

  const avgRatingText = $('[data-hook="rating-out-of-text"]').text().trim()
  const avgMatch = avgRatingText.match(/[\d.]+/)
  const average_rating = avgMatch ? parseFloat(avgMatch[0]) : null

  const totalText = $('[data-hook="total-review-count"]').text().trim()
  const totalMatch = totalText.match(/[\d,]+/)
  const total_ratings = totalMatch ? parseInt(totalMatch[0].replace(/,/g, '')) : null

  const reviews: Review[] = []

  $('[data-hook="review"]').each((_, el) => {
    const id = $(el).attr('id') ?? null

    const title = $(el).find('[data-hook="review-title"] span:last-child').text().trim()

    const ratingText = $(el).find('[data-hook="review-star-rating"] .a-icon-alt').text()
    const ratingMatch = ratingText.match(/[\d.]+/)
    const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null

    const body = $(el).find('[data-hook="review-body"] span').text().trim()
    const date = $(el).find('[data-hook="review-date"]').text().trim() || null
    const author = $(el).find('.a-profile-name').text().trim() || null

    const verified_purchase =
      $(el).find('[data-hook="avp-badge"]').length > 0

    const helpfulText = $(el).find('[data-hook="helpful-vote-statement"]').text().trim()
    const helpfulMatch = helpfulText.match(/(\d+)/)
    const helpful_votes = helpfulMatch ? parseInt(helpfulMatch[1]) : 0

    reviews.push({ id, title, body, rating, date, author, verified_purchase, helpful_votes })
  })

  return {
    asin,
    current_page: page,
    total_ratings,
    average_rating,
    reviews,
  }
}
