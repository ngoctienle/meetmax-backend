import express, { Router } from 'express'

import { SignUp } from '@authFeatures/controllers/signup.controller'
import { SignIn } from '@authFeatures/controllers/signin.controller'
import { SignOut } from '@authFeatures/controllers/signout.controller'
import { Password } from '@authFeatures/controllers/password.controller'

class AuthRoutes {
  private route: Router

  constructor() {
    this.route = express.Router()
  }

  public routes(): Router {
    this.route.post('/signup', SignUp.prototype.createAccount)
    this.route.post('/signin', SignIn.prototype.readAccount)
    this.route.post('/signout', SignOut.prototype.updateAccount)

    this.route.post('/forgot-password', Password.prototype.createPassword)
    this.route.post('/reset-password/:token', Password.prototype.updatePassword)

    return this.route
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()
