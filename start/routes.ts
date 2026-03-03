/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const ApiV1RequestController = () => import('#controllers/api/v1/request_controller')
const ApiV1ResultController = () => import('#controllers/api/v1/result_controller')
const ApiV1OpenApiController = () => import('#controllers/api/v1/openapi_controller')
const ApiV1ExportController = () => import('#controllers/api/v1/export_controller')
const ApiV1StripeWebhookController = () => import('#controllers/api/v1/stripe_webhook_controller')
const GoogleAuthController = () => import('#controllers/google_auth_controller')
const PasswordResetController = () => import('#controllers/password_reset_controller')
const WebhooksController = () => import('#controllers/webhooks_controller')
const BillingController = () => import('#controllers/billing_controller')

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])

    // Google OAuth
    router.get('auth/google/redirect', [GoogleAuthController, 'redirect']).as('auth.google.redirect')
    router.get('auth/google/callback', [GoogleAuthController, 'callback']).as('auth.google.callback')

    // Password reset
    router.get('forgot-password', [PasswordResetController, 'create']).as('password.forgot')
    router.post('forgot-password', [PasswordResetController, 'store'])
    router.get('reset-password/:token', [PasswordResetController, 'show']).as('password.show')
    router.post('reset-password', [PasswordResetController, 'update']).as('password.reset')
  })
  .use(middleware.guest())

const EmailVerificationController = () => import('#controllers/email_verification_controller')

// Authenticated but not necessarily verified
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    // Email verification
    router.get('verify-email', [EmailVerificationController, 'show']).as('verification.notice')
    router.get('verify-email/:token', [EmailVerificationController, 'verify']).as('verification.verify')
    router.post('verify-email/resend', [EmailVerificationController, 'resend']).as('verification.resend')
  })
  .use(middleware.auth())

// Authenticated AND verified
router
  .group(() => {
    // Dashboard
    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard.index')
    router.get('playground', [controllers.Dashboard, 'playground']).as('dashboard.playground')
    router.get('docs', [controllers.Dashboard, 'docs']).as('dashboard.docs')

    // API key management
    router.post('api-keys', [controllers.ApiKeys, 'store']).as('api_keys.store')
    router.post('api-keys/:id/rotate', [controllers.ApiKeys, 'rotate']).as('api_keys.rotate')
    router.delete('api-keys/:id', [controllers.ApiKeys, 'destroy']).as('api_keys.destroy')

    // Webhooks
    router.get('webhooks', [WebhooksController, 'index']).as('webhooks.index')
    router.post('webhooks', [WebhooksController, 'store']).as('webhooks.store')
    router.delete('webhooks/:id', [WebhooksController, 'destroy']).as('webhooks.destroy')
    router.post('webhooks/:id/test', [WebhooksController, 'test']).as('webhooks.test')

    // Billing
    router.get('billing', [BillingController, 'index']).as('billing.index')
    router.post('billing/checkout', [BillingController, 'checkout']).as('billing.checkout')
    router.post('billing/portal', [BillingController, 'portal']).as('billing.portal')

    // CSV export
    router.get('export/requests', [ApiV1ExportController, 'requests']).as('export.requests')
  })
  .use([middleware.auth(), middleware.verified()])

// Public API docs (no auth)
router
  .group(() => {
    router.get('openapi.json', [ApiV1OpenApiController, 'spec']).as('api.v1.openapi')
    router.get('docs', [ApiV1OpenApiController, 'docs']).as('api.v1.docs')
  })
  .prefix('/api/v1')

// Stripe webhook (public, raw body needed)
router.post('/api/v1/stripe/webhook', [ApiV1StripeWebhookController, 'handle']).as('api.v1.stripe.webhook')

// Public REST API — authenticated via API key, not session
router
  .group(() => {
    router.get('request', [ApiV1RequestController, 'handle']).as('api.v1.request')
    router.get('result/:id', [ApiV1ResultController, 'handle']).as('api.v1.result')
  })
  .prefix('/api/v1')
  .use(middleware.apiKey())
