/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  auth: {
    google: {
      redirect: typeof routes['auth.google.redirect']
      callback: typeof routes['auth.google.callback']
    }
  }
  password: {
    forgot: typeof routes['password.forgot']
    show: typeof routes['password.show']
    reset: typeof routes['password.reset']
  }
  passwordReset: {
    store: typeof routes['password_reset.store']
  }
  verification: {
    notice: typeof routes['verification.notice']
    verify: typeof routes['verification.verify']
    resend: typeof routes['verification.resend']
  }
  dashboard: {
    index: typeof routes['dashboard.index']
    playground: typeof routes['dashboard.playground']
    docs: typeof routes['dashboard.docs']
  }
  apiKeys: {
    store: typeof routes['api_keys.store']
    rotate: typeof routes['api_keys.rotate']
    destroy: typeof routes['api_keys.destroy']
  }
  webhooks: {
    index: typeof routes['webhooks.index']
    store: typeof routes['webhooks.store']
    destroy: typeof routes['webhooks.destroy']
    test: typeof routes['webhooks.test']
  }
  billing: {
    index: typeof routes['billing.index']
    checkout: typeof routes['billing.checkout']
    portal: typeof routes['billing.portal']
  }
  export: {
    requests: typeof routes['export.requests']
  }
  api: {
    v1: {
      openapi: typeof routes['api.v1.openapi']
      docs: typeof routes['api.v1.docs']
      stripe: {
        webhook: typeof routes['api.v1.stripe.webhook']
      }
      request: typeof routes['api.v1.request']
      result: typeof routes['api.v1.result']
    }
  }
}
