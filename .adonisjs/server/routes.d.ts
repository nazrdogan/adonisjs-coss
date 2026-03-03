import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password.reset': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.resend': { paramsTuple?: []; params?: {} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.playground': { paramsTuple?: []; params?: {} }
    'dashboard.docs': { paramsTuple?: []; params?: {} }
    'api_keys.store': { paramsTuple?: []; params?: {} }
    'api_keys.rotate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api_keys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.request': { paramsTuple?: []; params?: {} }
    'api.v1.result': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.playground': { paramsTuple?: []; params?: {} }
    'dashboard.docs': { paramsTuple?: []; params?: {} }
    'api.v1.request': { paramsTuple?: []; params?: {} }
    'api.v1.result': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.playground': { paramsTuple?: []; params?: {} }
    'dashboard.docs': { paramsTuple?: []; params?: {} }
    'api.v1.request': { paramsTuple?: []; params?: {} }
    'api.v1.result': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'verification.resend': { paramsTuple?: []; params?: {} }
    'api_keys.store': { paramsTuple?: []; params?: {} }
    'api_keys.rotate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'api_keys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}