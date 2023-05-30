import express, { Router } from 'express'

import { SignUp } from '@authFeatures/controllers/signup.controller'

class AuthRoutes {
  private route: Router

  constructor() {
    this.route = express.Router()
  }

  public routes(): Router {
    this.route.post('/signup', SignUp.prototype.createAccount)

    return this.route
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()
