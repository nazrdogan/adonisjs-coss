import User from '#models/user'
import ApiKey from '#models/api_key'
import Plan from '#models/plan'
import { signupValidator } from '#validators/user'
import { EmailVerificationService } from '#services/email_verification_service'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    // Assign the free plan
    const freePlan = await Plan.findBy('slug', 'free')
    const user = await User.create({ ...payload, planId: freePlan?.id ?? null })

    // Auto-generate an API key on signup
    await ApiKey.create({
      userId: user.id,
      name: 'Default',
      key: `em_${randomBytes(24).toString('hex')}`,
      isActive: true,
    })

    // Send verification email
    const verificationService = new EmailVerificationService()
    await verificationService.sendVerificationEmail(user)

    await auth.use('web').login(user)
    response.redirect().toRoute('verification.notice' as any)
  }
}
