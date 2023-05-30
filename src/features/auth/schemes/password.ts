import Joi, { ObjectSchema } from 'joi'

const emailSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().messages({
    'any.required': 'Email is a required field',
    'string.base': 'Email must be of type string',
    'string.empty': 'Email is a required field',
    'string.email': 'Email must be a valid email address'
  })
})

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(4).max(16).messages({
    'any.required': 'Password is a required field',
    'string.base': 'Password must be of type string',
    'string.empty': 'Password is a required field',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password must not exceed {#limit} characters'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords should match',
    'any.required': 'Confirm password is a required field'
  })
})

export { emailSchema, passwordSchema }
