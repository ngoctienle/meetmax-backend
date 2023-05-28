import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'

import { environment } from '@root/environment'
import { authService } from '@service/db/auth.service'

const log: Logger = environment.createLogger('authWorker')

class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data
      await authService.createAuthUser(value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker()
