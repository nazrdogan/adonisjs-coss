import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import env from '#start/env'
import User from '#models/user'

export class PasswordResetService {
  /**
   * Token expires after 60 minutes.
   */
  private tokenExpiryMinutes = 60

  generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  buildResetUrl(token: string): string {
    const appUrl = env.get('APP_URL')
    return `${appUrl}/reset-password/${token}`
  }

  async sendResetEmail(user: User): Promise<void> {
    const token = this.generateToken()
    user.passwordResetToken = token
    user.passwordResetTokenCreatedAt = DateTime.now()
    await user.save()

    const url = this.buildResetUrl(token)

    // In development, log the URL. In production, wire to your mailer.
    if (env.get('NODE_ENV') === 'development') {
      console.log(`\n🔑 Password reset for ${user.email}:`)
      console.log(`   ${url}\n`)
    }

    // TODO: Wire to actual email provider
    // await mail.send((message) => {
    //   message.to(user.email).subject('Reset your password').htmlView('emails/reset-password', { url })
    // })
  }

  async findUserByToken(token: string): Promise<User | null> {
    const user = await User.findBy('password_reset_token', token)
    if (!user || !user.passwordResetTokenCreatedAt) {
      return null
    }

    const expiresAt = user.passwordResetTokenCreatedAt.plus({ minutes: this.tokenExpiryMinutes })
    if (DateTime.now() > expiresAt) {
      return null
    }

    return user
  }

  async resetPassword(user: User, newPassword: string): Promise<void> {
    user.password = newPassword
    user.passwordResetToken = null
    user.passwordResetTokenCreatedAt = null
    await user.save()
  }
}
