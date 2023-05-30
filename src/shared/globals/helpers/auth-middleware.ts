import JWT from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

import { environment } from '@root/environment'

import { AuthPayload } from '@authFeatures/interfaces/auth.interface'

import { NotAuthorizedError } from '@global/helpers/error-handler'

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.')
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, environment.JWT_TOKEN!) as AuthPayload
      req.currentUser = payload
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please login again.')
    }
    next()
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.')
    }
    next()
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()
