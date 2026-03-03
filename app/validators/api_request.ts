import vine from '@vinejs/vine'

const VALID_TYPES = [
  'product',
  'search',
  'reviews',
  'offers',
  'category',
  'bestsellers',
  'deals',
  'questions',
  'seller',
] as const

const SUPPORTED_DOMAINS = [
  'amazon.com',
  'amazon.co.uk',
  'amazon.de',
  'amazon.fr',
  'amazon.it',
  'amazon.es',
  'amazon.ca',
  'amazon.com.au',
  'amazon.co.jp',
  'amazon.in',
  'amazon.com.br',
  'amazon.com.mx',
  'amazon.nl',
  'amazon.sg',
  'amazon.se',
  'amazon.pl',
  'amazon.com.be',
  'amazon.com.tr',
  'amazon.sa',
  'amazon.ae',
  'amazon.eg',
] as const

export const apiRequestValidator = vine.create({
  type: vine.enum(VALID_TYPES),
  amazon_domain: vine.enum(SUPPORTED_DOMAINS).optional(),
  page: vine.number().positive().withoutDecimals().optional(),
  async: vine.string().in(['true', 'false']).optional(),
  country: vine.string().maxLength(2).minLength(2).optional(),
  output: vine.enum(['json', 'csv']).optional(),

  // Conditionally required params — validated at controller level
  asin: vine
    .string()
    .alphaNumeric()
    .fixedLength(10)
    .optional(),
  search_term: vine.string().minLength(1).maxLength(500).optional(),
  browse_node_id: vine.string().minLength(1).maxLength(30).optional(),
  category: vine.string().minLength(1).maxLength(100).optional(),
  seller_id: vine.string().minLength(1).maxLength(30).optional(),
})
