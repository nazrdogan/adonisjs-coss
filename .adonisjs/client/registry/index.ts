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
