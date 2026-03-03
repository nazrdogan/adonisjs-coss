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
const PasswordResetController = () => import('#controllers/password_reset_controller')

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])

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
  })
  .use([middleware.auth(), middleware.verified()])

// Public REST API — authenticated via API key, not session
router
  .group(() => {
    router.get('request', [ApiV1RequestController, 'handle']).as('api.v1.request')
    router.get('result/:id', [ApiV1ResultController, 'handle']).as('api.v1.result')
  })
  .prefix('/api/v1')
  .use(middleware.apiKey())
