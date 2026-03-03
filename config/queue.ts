import env from '#start/env'
import { defineConfig } from '@rlanz/bull-queue'

export default defineConfig({
  defaultConnection: {
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: env.get('REDIS_PASSWORD') || undefined,
  },

  queue: {
    defaultJobOptions: {
      attempts: 1,
      timeout: 120000,
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 7200, count: 500 },
    },
  },

  worker: {
    concurrency: 5,
  },

  jobs: {},
})
