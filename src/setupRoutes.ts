import { Application } from 'express'

import { authMiddleware } from '@global/helpers/auth-middleware'

import { serverAdapter } from '@service/queues/base.queue'

import { authRoutes } from '@authFeatures/routes/authRoutes'
import { currentUserRoutes } from '@authFeatures/routes/currentRoutes'
import { healthRoutes } from '@userFeatures/routes/healthRoutes'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter())
    app.use('', healthRoutes.health())
    app.use('', healthRoutes.env())
    app.use('', healthRoutes.instance())
    app.use('', healthRoutes.fiboRoutes())

    /* Authentication Routes */
    app.use(`${BASE_PATH}`, authRoutes.routes())
    app.use(`${BASE_PATH}`, authMiddleware.verifyUser, currentUserRoutes.routes())
  }

  routes()
}
