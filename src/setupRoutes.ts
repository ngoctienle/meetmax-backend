import { Application } from 'express'

import { authRoutes } from '@authFeatures/routes/authRoutes'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
  const routes = () => {
    /* Authentication Routes */
    app.use(`${BASE_PATH}`, authRoutes.routes())
  }

  routes()
}
