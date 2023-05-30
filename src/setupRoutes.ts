import { Application } from 'express'

import { authRoutes } from '@authFeatures/routes/authRoutes'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { currentUserRoutes } from '@authFeatures/routes/currentRoutes'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
  const routes = () => {
    /* Authentication Routes */
    app.use(`${BASE_PATH}`, authRoutes.routes())
    app.use(`${BASE_PATH}`, authMiddleware.verifyUser, currentUserRoutes.routes())
  }

  routes()
}
