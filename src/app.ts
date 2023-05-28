import express, { Express } from 'express'
import Logger from 'bunyan'

import { environment } from '@root/environment'
import { MeetMaxServer } from '@root/setupServer'
import dbConnect from '@root/setupDatabase'

const log: Logger = environment.createLogger('app')

class MeetMaxApplication {
  public initialize(): void {
    this.loadConfig()
    dbConnect()

    const app: Express = express()
    const server: MeetMaxServer = new MeetMaxServer(app)

    server.start()

    MeetMaxApplication.handleExit()
  }

  private loadConfig(): void {
    environment.validateConfig()
    environment.cloudinaryConfig()
  }

  private static shutDownProperly(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete')
        process.exit(exitCode)
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`)
        process.exit(1)
      })
  }

  private static handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`)
      MeetMaxApplication.shutDownProperly(1)
    })

    process.on('unhandleRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`)
      MeetMaxApplication.shutDownProperly(2)
    })

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM')
      MeetMaxApplication.shutDownProperly(2)
    })

    process.on('SIGINT', () => {
      log.error('Caught SIGINT')
      MeetMaxApplication.shutDownProperly(2)
    })

    process.on('exit', () => {
      log.error('Exiting')
    })
  }
}

const meetmaxApp: MeetMaxApplication = new MeetMaxApplication()
meetmaxApp.initialize()
