import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EmailVerifiedMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth.user

    if (user && !user.emailVerifiedAt) {
      return response.redirect().toRoute('verification.notice' as any)
    }

    await next()
  }
}
