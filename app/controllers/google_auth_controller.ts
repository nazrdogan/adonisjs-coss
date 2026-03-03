import User from '#models/user'
import ApiKey from '#models/api_key'
import Plan from '#models/plan'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

export default class GoogleAuthController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async callback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash('errors', { google: 'Access was denied.' })
      return response.redirect().toRoute('session.create')
    }

    if (google.stateMisMatch()) {
      session.flash('errors', { google: 'Request expired. Please try again.' })
      return response.redirect().toRoute('session.create')
    }

    if (google.hasError()) {
      session.flash('errors', { google: 'Something went wrong. Please try again.' })
      return response.redirect().toRoute('session.create')
    }

    const googleUser = await google.user()

    // Case 1: User with matching google_id exists → log in
    const existingGoogleUser = await User.findBy('googleId', googleUser.id)
    if (existingGoogleUser) {
      await auth.use('web').login(existingGoogleUser)
      return response.redirect().toRoute('dashboard.index')
    }

    // Case 2: User with matching email exists → link google_id, auto-verify, log in
    const existingEmailUser = await User.findBy('email', googleUser.email!)
    if (existingEmailUser) {
      existingEmailUser.googleId = googleUser.id
      if (!existingEmailUser.emailVerifiedAt) {
        existingEmailUser.emailVerifiedAt = DateTime.now()
      }
      await existingEmailUser.save()
      await auth.use('web').login(existingEmailUser)
      return response.redirect().toRoute('dashboard.index')
    }

    // Case 3: New user → create with free plan, generate API key, auto-verify, log in
    const freePlan = await Plan.findBy('slug', 'free')
    const user = await User.create({
      fullName: googleUser.name,
      email: googleUser.email!,
      googleId: googleUser.id,
      planId: freePlan?.id ?? null,
      emailVerifiedAt: DateTime.now(),
    })

    await ApiKey.create({
      userId: user.id,
      name: 'Default',
      key: `em_${randomBytes(24).toString('hex')}`,
      isActive: true,
    })

    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard.index')
  }
}
