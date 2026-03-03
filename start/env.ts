/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.secret(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Redis connection
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for scraper proxy pool
  |----------------------------------------------------------
  */
  SCRAPER_PROXY_URLS: Env.schema.string.optional(),
  SCRAPER_PROXY_GEOS: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for CAPTCHA solving (2Captcha)
  |----------------------------------------------------------
  */
  CAPTCHA_2CAPTCHA_API_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for Playwright browser pool
  |----------------------------------------------------------
  */
  PLAYWRIGHT_ENABLED: Env.schema.boolean.optional(),
  PLAYWRIGHT_MAX_CONTEXTS: Env.schema.number.optional(),

  /*
  |----------------------------------------------------------
  | Variables for Stripe billing
  |----------------------------------------------------------
  */
  /*
  |----------------------------------------------------------
  | Variables for Google OAuth
  |----------------------------------------------------------
  */
  GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),
  GOOGLE_CALLBACK_URL: Env.schema.string.optional(),

  STRIPE_SECRET_KEY: Env.schema.string.optional(),
  STRIPE_WEBHOOK_SECRET: Env.schema.string.optional(),
  STRIPE_STARTER_PRICE_ID: Env.schema.string.optional(),
  STRIPE_GROWTH_PRICE_ID: Env.schema.string.optional(),
  STRIPE_PRO_PRICE_ID: Env.schema.string.optional(),
})
