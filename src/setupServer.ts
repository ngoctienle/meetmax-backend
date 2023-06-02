import { Application, json, urlencoded, Response, Request, NextFunction } from 'express'
import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

import apiStats from 'swagger-stats'
import compression from 'compression'
import hpp from 'hpp'
import Logger from 'bunyan'
import cookieSession from 'cookie-session'
import helmet from 'helmet'
import cors from 'cors'
import HTTP_STATUS from 'http-status-codes'
import http from 'http'

import appRoutes from '@root/setupRoutes'
import { environment } from '@root/environment'
import { IErrorResponse, CustomError } from '@global/helpers/error-handler'

import { SocketIOPostHandler } from '@socket/post'
import { SocketIONotificationHandler } from '@socket/notification'

const SERVER_PORT = 12313
const log: Logger = environment.createLogger('server')

export class MeetMaxServer {
  private app: Application

  constructor(app: Application) {
    this.app = app
  }

  public start(): void {
    this.securityMiddleware(this.app)
    this.standardMiddleware(this.app)
    this.routesMiddleware(this.app)
    this.apiMonitoring(this.app)
    this.globalErrorHandler(this.app)
    this.startServer(this.app)
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1)
    app.use(
      cookieSession({
        name: 'session',
        keys: [environment.SECRET_KEY_ONE!, environment.SECRET_KEY_TWO!],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: environment.NODE_ENV !== 'development',
        sameSite: 'none'
      })
    )
    app.use(helmet())
    app.use(hpp())
    app.use(
      cors({
        origin: environment.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    )
  }

  private standardMiddleware(app: Application): void {
    app.use(json())
    app.use(urlencoded({ extended: true }))
    app.use(compression())
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app)
  }

  private apiMonitoring(app: Application): void {
    app.use(apiStats.getMiddleware({ uriPath: '/api-monitoring' }))
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', async (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: `${req.originalUrl} not found!` })
        .end()
    })

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error)
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors()).end()
      }
      next()
    })
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const socketIO: Server = new Server(httpServer, {
      cors: {
        origin: environment.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
      }
    })

    const pubClient = createClient({ url: environment.REDIS_HOST })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])
    socketIO.adapter(createAdapter(pubClient, subClient))

    return socketIO
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with process id of ${process.pid} has started...`)
    log.info(`Server has started with process ${process.pid}`)

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`)
    })
  }

  private socketIOConnection(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io)
    const notificationSocketHandler: SocketIONotificationHandler = new SocketIONotificationHandler()

    postSocketHandler.listen()
    notificationSocketHandler.listen(io)
  }

  private async startServer(app: Application): Promise<void> {
    if (!environment.JWT_TOKEN) {
      throw new Error('JWT_TOKEN is not defined')
    }
    try {
      const httpServer: http.Server = new http.Server(app)
      const socketIO: Server = await this.createSocketIO(httpServer)

      this.startHttpServer(httpServer)
      this.socketIOConnection(socketIO)
    } catch (error) {
      log.error(error)
    }
  }
}
