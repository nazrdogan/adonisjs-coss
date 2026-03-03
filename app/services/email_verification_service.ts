import { randomBytes } from 'node:crypto'
import env from '#start/env'
import User from '#models/user'

export class EmailVerificationService {
  generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  buildVerificationUrl(token: string): string {
    const appUrl = env.get('APP_URL')
    return `${appUrl}/verify-email/${token}`
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const token = this.generateToken()
    user.emailVerificationToken = token
    await user.save()

    const url = this.buildVerificationUrl(token)

    // In development, log the URL. In production, wire to your mailer (SES, Resend, etc.)
    if (env.get('NODE_ENV') === 'development') {
      console.log(`\n📧 Verification email for ${user.email}:`)
      console.log(`   ${url}\n`)
    }

    // TODO: Wire to actual email provider
    // await mail.send((message) => {
    //   message.to(user.email).subject('Verify your email').htmlView('emails/verify', { url })
    // })
  }
}
