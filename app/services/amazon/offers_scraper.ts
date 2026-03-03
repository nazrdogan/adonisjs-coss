import * as cheerio from 'cheerio'

export interface Offer {
  price: number | null
  currency: string
  condition: string | null
  seller_name: string | null
  seller_rating: string | null
  delivery: string | null
  is_prime: boolean
}

export interface OffersPageResult {
  asin: string
  offers: Offer[]
}

export function parseOffersPage(html: string, asin: string, _domain: string): OffersPageResult {
  const $ = cheerio.load(html)
  const offers: Offer[] = []

  $('#aod-offer, .olpOffer').each((_, el) => {
    const priceRaw =
      $(el).find('.a-price .a-offscreen').first().text().trim() ||
      $(el).find('.olpOfferPrice').text().trim()
    const priceMatch = priceRaw.match(/[\d,.]+/)
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null
    const currency = priceRaw.match(/[^\d\s,.]+/)?.[0] ?? '$'

    const condition =
      $(el).find('#aod-offer-heading h5').text().trim() ||
      $(el).find('.olpCondition').text().trim() ||
      null

    const seller_name =
      $(el).find('#aod-offer-soldBy .a-link-normal').text().trim() ||
      $(el).find('.olpSellerName a').text().trim() ||
      null

    const seller_rating =
      $(el).find('#aod-offer-seller-rating').text().trim() ||
      $(el).find('.olpSellerColumn .a-icon-alt').text().trim() ||
      null

    const delivery =
      $(el).find('#aod-offer-deliveryMessage').text().trim() ||
      $(el).find('.olpDeliveryColumn').text().trim() ||
      null

    const is_prime = $(el).find('.a-icon-prime, i.a-icon-prime').length > 0

    offers.push({ price, currency, condition, seller_name, seller_rating, delivery, is_prime })
  })

  return { asin, offers }
}
