import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

/**
 * Validator to use when logging in
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string().minLength(1),
})

/**
 * Validator for the forgot-password form
 */
export const forgotPasswordValidator = vine.create({
  email: email(),
})

/**
 * Validator for the reset-password form
 */
export const resetPasswordValidator = vine.create({
  token: vine.string(),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})
