import { ObjectSchema } from 'joi'
import { Request } from 'express'

import { JoiRequestValidationError } from '@global/helpers/error-handler'

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...arg: any[]) {
      const req: Request = arg[0]
      const { error } = await Promise.resolve(schema.validate(req.body))
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message)
      }

      return originalMethod.apply(this, arg)
    }
    return descriptor
  }
}
