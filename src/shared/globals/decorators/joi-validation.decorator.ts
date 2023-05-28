import { ObjectSchema } from 'joi'
import { Request } from 'express'

import { JoiRequestValidationError } from '@global/helpers/error-handler'

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void

/**
 * Decorator function to perform Joi validation on an Express.js request body.
 * @param schema - The Joi Schema to validate the request body against.
 * @returns A method decorator that performs the validation.
 */
export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: unknown, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const req: Request = args[0]
      // Check that the first argument is an Express request object and that it has a body.
      if (!req || typeof req !== 'object' || !('body' in req)) {
        throw new Error(`Expected the first argument to be a Request object with a body, but got ${typeof req}`)
      }

      const { error } = schema.validate(req.body)
      if (error?.details) {
        const errors = error.details.map((err) => err.message)
        throw new JoiRequestValidationError(errors.join('; '))
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}
