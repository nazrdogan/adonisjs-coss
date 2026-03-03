import type { HttpContext } from '@adonisjs/core/http'
import ApiKey from '#models/api_key'
import { randomBytes } from 'node:crypto'

function generateKey(): string {
  return `em_${randomBytes(24).toString('hex')}`
}

export default class ApiKeysController {
  async store({ auth, response, session }: HttpContext) {
    const user = auth.user!

    const existingCount = await ApiKey.query()
      .where('user_id', user.id)
      .where('is_active', true)
      .count('* as total')

    const total = Number((existingCount[0] as any).$extras.total)
    if (total >= 5) {
      session.flash('errorsBag', { limit: 'Maximum of 5 active API keys allowed.' })
      return response.redirect().back()
    }

    await ApiKey.create({
      userId: user.id,
      name: 'Default',
      key: generateKey(),
      isActive: true,
    })

    return response.redirect().toRoute('dashboard.index')
  }

  async destroy({ auth, params, response }: HttpContext) {
    await ApiKey.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .update({ is_active: false })

    return response.redirect().toRoute('dashboard.index')
  }

  async rotate({ auth, params, response }: HttpContext) {
    const apiKey = await ApiKey.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .where('is_active', true)
      .first()

    if (!apiKey) {
      return response.redirect().toRoute('dashboard.index')
    }

    apiKey.key = generateKey()
    await apiKey.save()

    return response.redirect().toRoute('dashboard.index')
  }
}
