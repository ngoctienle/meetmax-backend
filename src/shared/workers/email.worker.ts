import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'

import { environment } from '@root/environment'

import { mailTransport } from '@service/emails/main.transport'

const log: Logger = environment.createLogger('emailWorker')

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data
      /* Add method to send data to database */
      await mailTransport.sendEmail(receiverEmail, subject, template)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker()
