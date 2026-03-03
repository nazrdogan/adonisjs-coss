import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'auth/verify-email': ExtractProps<(typeof import('../../inertia/pages/auth/verify-email.tsx'))['default']>
    'dashboard/docs': ExtractProps<(typeof import('../../inertia/pages/dashboard/docs.tsx'))['default']>
    'dashboard/index': ExtractProps<(typeof import('../../inertia/pages/dashboard/index.tsx'))['default']>
    'dashboard/playground': ExtractProps<(typeof import('../../inertia/pages/dashboard/playground.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'auth/forgot-password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot-password.tsx'))['default']>
    'auth/reset-password': ExtractProps<(typeof import('../../inertia/pages/auth/reset-password.tsx'))['default']>
  }
}
