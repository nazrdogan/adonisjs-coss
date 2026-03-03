/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'auth.google.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/redirect',
    tokens: [{"old":"/auth/google/redirect","type":0,"val":"auth","end":""},{"old":"/auth/google/redirect","type":0,"val":"google","end":""},{"old":"/auth/google/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.google.redirect']['types'],
  },
  'auth.google.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/callback',
    tokens: [{"old":"/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/auth/google/callback","type":0,"val":"google","end":""},{"old":"/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.google.callback']['types'],
  },
  'password.forgot': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password.forgot']['types'],
  },
  'password_reset.store': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password_reset.store']['types'],
  },
  'password.show': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['password.show']['types'],
  },
  'password.reset': {
    methods: ["POST"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password.reset']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'verification.notice': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email',
    tokens: [{"old":"/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['verification.notice']['types'],
  },
  'verification.verify': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email/:token',
    tokens: [{"old":"/verify-email/:token","type":0,"val":"verify-email","end":""},{"old":"/verify-email/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['verification.verify']['types'],
  },
  'verification.resend': {
    methods: ["POST"],
    pattern: '/verify-email/resend',
    tokens: [{"old":"/verify-email/resend","type":0,"val":"verify-email","end":""},{"old":"/verify-email/resend","type":0,"val":"resend","end":""}],
    types: placeholder as Registry['verification.resend']['types'],
  },
  'dashboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard.index']['types'],
  },
  'dashboard.playground': {
    methods: ["GET","HEAD"],
    pattern: '/playground',
    tokens: [{"old":"/playground","type":0,"val":"playground","end":""}],
    types: placeholder as Registry['dashboard.playground']['types'],
  },
  'dashboard.docs': {
    methods: ["GET","HEAD"],
    pattern: '/docs',
    tokens: [{"old":"/docs","type":0,"val":"docs","end":""}],
    types: placeholder as Registry['dashboard.docs']['types'],
  },
  'api_keys.store': {
    methods: ["POST"],
    pattern: '/api-keys',
    tokens: [{"old":"/api-keys","type":0,"val":"api-keys","end":""}],
    types: placeholder as Registry['api_keys.store']['types'],
  },
  'api_keys.rotate': {
    methods: ["POST"],
    pattern: '/api-keys/:id/rotate',
    tokens: [{"old":"/api-keys/:id/rotate","type":0,"val":"api-keys","end":""},{"old":"/api-keys/:id/rotate","type":1,"val":"id","end":""},{"old":"/api-keys/:id/rotate","type":0,"val":"rotate","end":""}],
    types: placeholder as Registry['api_keys.rotate']['types'],
  },
  'api_keys.destroy': {
    methods: ["DELETE"],
    pattern: '/api-keys/:id',
    tokens: [{"old":"/api-keys/:id","type":0,"val":"api-keys","end":""},{"old":"/api-keys/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api_keys.destroy']['types'],
  },
  'webhooks.index': {
    methods: ["GET","HEAD"],
    pattern: '/webhooks',
    tokens: [{"old":"/webhooks","type":0,"val":"webhooks","end":""}],
    types: placeholder as Registry['webhooks.index']['types'],
  },
  'webhooks.store': {
    methods: ["POST"],
    pattern: '/webhooks',
    tokens: [{"old":"/webhooks","type":0,"val":"webhooks","end":""}],
    types: placeholder as Registry['webhooks.store']['types'],
  },
  'webhooks.destroy': {
    methods: ["DELETE"],
    pattern: '/webhooks/:id',
    tokens: [{"old":"/webhooks/:id","type":0,"val":"webhooks","end":""},{"old":"/webhooks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['webhooks.destroy']['types'],
  },
  'webhooks.test': {
    methods: ["POST"],
    pattern: '/webhooks/:id/test',
    tokens: [{"old":"/webhooks/:id/test","type":0,"val":"webhooks","end":""},{"old":"/webhooks/:id/test","type":1,"val":"id","end":""},{"old":"/webhooks/:id/test","type":0,"val":"test","end":""}],
    types: placeholder as Registry['webhooks.test']['types'],
  },
  'billing.index': {
    methods: ["GET","HEAD"],
    pattern: '/billing',
    tokens: [{"old":"/billing","type":0,"val":"billing","end":""}],
    types: placeholder as Registry['billing.index']['types'],
  },
  'billing.checkout': {
    methods: ["POST"],
    pattern: '/billing/checkout',
    tokens: [{"old":"/billing/checkout","type":0,"val":"billing","end":""},{"old":"/billing/checkout","type":0,"val":"checkout","end":""}],
    types: placeholder as Registry['billing.checkout']['types'],
  },
  'billing.portal': {
    methods: ["POST"],
    pattern: '/billing/portal',
    tokens: [{"old":"/billing/portal","type":0,"val":"billing","end":""},{"old":"/billing/portal","type":0,"val":"portal","end":""}],
    types: placeholder as Registry['billing.portal']['types'],
  },
  'export.requests': {
    methods: ["GET","HEAD"],
    pattern: '/export/requests',
    tokens: [{"old":"/export/requests","type":0,"val":"export","end":""},{"old":"/export/requests","type":0,"val":"requests","end":""}],
    types: placeholder as Registry['export.requests']['types'],
  },
  'api.v1.openapi': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/openapi.json',
    tokens: [{"old":"/api/v1/openapi.json","type":0,"val":"api","end":""},{"old":"/api/v1/openapi.json","type":0,"val":"v1","end":""},{"old":"/api/v1/openapi.json","type":0,"val":"openapi.json","end":""}],
    types: placeholder as Registry['api.v1.openapi']['types'],
  },
  'api.v1.docs': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/docs',
    tokens: [{"old":"/api/v1/docs","type":0,"val":"api","end":""},{"old":"/api/v1/docs","type":0,"val":"v1","end":""},{"old":"/api/v1/docs","type":0,"val":"docs","end":""}],
    types: placeholder as Registry['api.v1.docs']['types'],
  },
  'api.v1.stripe.webhook': {
    methods: ["POST"],
    pattern: '/api/v1/stripe/webhook',
    tokens: [{"old":"/api/v1/stripe/webhook","type":0,"val":"api","end":""},{"old":"/api/v1/stripe/webhook","type":0,"val":"v1","end":""},{"old":"/api/v1/stripe/webhook","type":0,"val":"stripe","end":""},{"old":"/api/v1/stripe/webhook","type":0,"val":"webhook","end":""}],
    types: placeholder as Registry['api.v1.stripe.webhook']['types'],
  },
  'api.v1.request': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/request',
    tokens: [{"old":"/api/v1/request","type":0,"val":"api","end":""},{"old":"/api/v1/request","type":0,"val":"v1","end":""},{"old":"/api/v1/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['api.v1.request']['types'],
  },
  'api.v1.result': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/result/:id',
    tokens: [{"old":"/api/v1/result/:id","type":0,"val":"api","end":""},{"old":"/api/v1/result/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/result/:id","type":0,"val":"result","end":""},{"old":"/api/v1/result/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.result']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
