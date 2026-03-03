import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { PasswordResetService } from '#services/password_reset_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/user'

export default class PasswordResetController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password' as any, {})
  }

  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)

    // Always show success to prevent email enumeration
    if (user) {
      const service = new PasswordResetService()
      await service.sendResetEmail(user)
    }

    session.flash('success', 'If an account exists with that email, we sent a reset link.')
    return response.redirect().back()
  }

  async show({ inertia, params, response, session }: HttpContext) {
    const token = params.token as string
    const service = new PasswordResetService()
    const user = await service.findUserByToken(token)

    if (!user) {
      session.flash('error', 'This password reset link is invalid or has expired.')
      return response.redirect().toRoute('password.forgot' as any)
    }

    return inertia.render('auth/reset-password' as any, { token })
  }

  async update({ request, response, session }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const service = new PasswordResetService()
    const user = await service.findUserByToken(token)

    if (!user) {
      session.flash('error', 'This password reset link is invalid or has expired.')
      return response.redirect().toRoute('password.forgot' as any)
    }

    await service.resetPassword(user, password)

    session.flash('success', 'Your password has been reset. You can now log in.')
    return response.redirect().toRoute('session.create')
  }
}
