import env from '#start/env'

const stripeConfig = {
  secretKey: env.get('STRIPE_SECRET_KEY', ''),
  webhookSecret: env.get('STRIPE_WEBHOOK_SECRET', ''),
  returnUrl: `${env.get('APP_URL')}/dashboard`,
  cancelUrl: `${env.get('APP_URL')}/billing`,
}

export default stripeConfig
