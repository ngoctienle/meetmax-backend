import Joi, { ObjectSchema } from 'joi'

const signUpSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(16).messages({
    'any.required': 'Username is a required field',
    'string.base': 'Username must be of type string',
    'string.empty': 'Username is a required field',
    'string.min': 'Username must be at least {#limit} characters long',
    'string.max': 'Username must not exceed {#limit} characters'
  }),
  password: Joi.string().required().min(4).max(16).messages({
    'any.required': 'Password is a required field',
    'string.base': 'Password must be of type string',
    'string.empty': 'Password is a required field',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password must not exceed {#limit} characters'
  }),
  email: Joi.string().required().email().messages({
    'any.required': 'Email is a required field',
    'string.base': 'Email must be of type string',
    'string.empty': 'Email is a required field',
    'string.email': 'Email must be a valid email address'
  }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
})

export { signUpSchema }
