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
  api: {
    v1: {
      request: typeof routes['api.v1.request']
      result: typeof routes['api.v1.result']
    }
  }
}
