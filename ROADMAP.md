# Emerald API — Roadmap

> A real-time Amazon product data API — rival to Rainforest API.
> Built on AdonisJS 7 + Inertia + React 19 + ShadCN.

---

## Phase 1 — Foundation
**Goal:** Core infrastructure and auth system.

- [ ] User auth — signup, login, email verification
- [ ] API key management — generate, rotate, revoke keys per user
- [ ] Usage tracking model — log every request (user, key, endpoint, timestamp, credits used)
- [ ] Database schema — users, api_keys, requests, plans, subscriptions
- [ ] Rate limiting middleware per API key (req/sec + monthly caps)
- [ ] Basic dashboard UI — show API key, usage stats, request history
- [ ] Upgrade database from SQLite to PostgreSQL
- [ ] Add Redis to the stack (queues + caching)

---

## Phase 2 — Core Scraping Engine
**Goal:** The actual data engine.

### Amazon Data Types to Support

| Endpoint | Data |
|---|---|
| `/product` | Title, price, images, description, specs, ASIN, GTIN |
| `/product/reviews` | Star ratings, review text, verified purchase, date |
| `/product/offers` | All seller offers, prices, shipping, Prime status |
| `/search` | Search results, sponsored products, filters |
| `/category` | Browse node listings, pagination |
| `/bestsellers` | Best seller rankings per category |
| `/deals` | Lightning deals, coupons |
| `/questions` | Customer Q&A |
| `/seller` | Seller profile, ratings, products |

### Scraping Infrastructure

- [ ] Proxy pool manager (residential proxies — Oxylabs, Brightdata, Webshare)
- [ ] Request queue (BullMQ + Redis) for async/batch requests
- [ ] Browser automation layer (Playwright) for JS-rendered pages
- [ ] HTML parser layer (Cheerio) for static pages — faster + cheaper
- [ ] CAPTCHA handling (2captcha / CapMonster integration)
- [ ] Geo-targeting — scrape from specific Amazon locales (`.com`, `.co.uk`, `.de`, `.co.jp`)
- [ ] Retry logic with exponential backoff
- [ ] Response caching layer (Redis TTL-based) to reduce duplicate scrapes

---

## Phase 3 — REST API Layer
**Goal:** The customer-facing API surface.

- [ ] RESTful API routes under `/api/v1/`
- [ ] Request validation with VineJS (ASIN format, locale, params)
- [ ] Async mode — return `request_id`, poll for result (for slow scrapes)
- [ ] Sync mode — wait up to 30s, return inline result
- [ ] Webhook support — POST result to customer URL when ready
- [ ] Structured JSON responses (consistent schema across all endpoints)
- [ ] CSV export for bulk data
- [ ] Clear error codes and error messages
- [ ] OpenAPI/Swagger spec auto-generation

---

## Phase 4 — Dashboard & Developer Experience
**Goal:** The app that customers actually use.

- [ ] Dashboard — real-time usage charts, credits remaining, request log
- [ ] API playground — test requests in-browser (like Postman)
- [ ] API docs — generated from OpenAPI spec with code examples (curl, Node, Python, PHP)
- [ ] Webhook tester UI
- [ ] Request history with full response viewer
- [ ] CSV export UI for bulk results
- [ ] Alerts — notify when approaching plan limits

---

## Phase 5 — Billing & Plans
**Goal:** Monetization.

### Plan Tiers

| Plan | Requests/mo | Price |
|---|---|---|
| Free Trial | 100 | $0 |
| Starter | 5,000 | $29/mo |
| Growth | 50,000 | $99/mo |
| Pro | 500,000 | $299/mo |
| Enterprise | Unlimited | Custom |

- [ ] Stripe integration — subscriptions + usage-based billing
- [ ] Credit system — prepaid credits as alternative to subscriptions
- [ ] Overage billing — charge per request beyond plan limit
- [ ] Upgrade/downgrade flows, invoice history, cancellation

---

## Phase 6 — Reliability & Scale
**Goal:** Production-grade stability.

- [ ] Multi-region scraping workers (US, EU, Asia for geo-targeted Amazon)
- [ ] Queue priority tiers (paid customers get priority over free tier)
- [ ] SLA monitoring — alert on scrape failure rates
- [ ] Status page
- [ ] Admin panel — manage users, inspect requests, flag abuse
- [ ] Anomaly detection — flag abuse patterns / API key sharing
- [ ] Structured logging (Pino) + APM (Sentry or Datadog)

---

## Phase 7 — Differentiation
**Goal:** Go beyond Rainforest API.

- [ ] **Historical data** — store product snapshots, enable price history queries
- [ ] **Price drop alerts** — customers track ASINs and get notified
- [ ] **Bulk ASIN upload** — CSV upload to queue hundreds of products at once
- [ ] **Scheduled scrapes** — cron-style recurring requests per ASIN
- [ ] **Data normalization** — structured product categories, standardized units
- [ ] **More Amazon locales** — broader marketplace coverage than competitors
- [ ] **AI enrichment** — sentiment analysis on reviews, category classification

---

## Tech Stack

| Layer | Tech |
|---|---|
| Web framework | AdonisJS 7 |
| Frontend | Inertia + React 19 + ShadCN |
| Job queue | BullMQ + Redis |
| Scraping | Playwright + Cheerio |
| Caching | Redis |
| Database | PostgreSQL |
| Billing | Stripe |
| Proxies | Oxylabs / Brightdata / Webshare |
| Monitoring | Sentry + Pino |
| Deployment | Fly.io or Railway |
