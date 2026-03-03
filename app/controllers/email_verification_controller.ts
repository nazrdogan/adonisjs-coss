import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { EmailVerificationService } from '#services/email_verification_service'

export default class EmailVerificationController {
  async show({ inertia, auth }: HttpContext) {
    const user = auth.user!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return inertia.render('auth/verify-email' as any, {
      email: user.email,
    })
  }

  async verify({ params, response, auth, session }: HttpContext) {
    const token = params.token as string

    const user = await User.findBy('email_verification_token', token)

    if (!user) {
      session.flash('errorsBag', { token: 'Invalid or expired verification link.' })
      return response.redirect().back()
    }

    user.emailVerifiedAt = DateTime.now()
    user.emailVerificationToken = null
    await user.save()

    // If user is logged in, redirect to dashboard
    if (auth.user) {
      return response.redirect().toRoute('dashboard.index')
    }

    return response.redirect().toRoute('session.create')
  }

  async resend({ auth, response, session }: HttpContext) {
    const user = auth.user!

    if (user.emailVerifiedAt) {
      return response.redirect().toRoute('dashboard.index')
    }

    const service = new EmailVerificationService()
    await service.sendVerificationEmail(user)

    session.flash('success', 'Verification email sent! Check your inbox.')
    return response.redirect().back()
  }
}
