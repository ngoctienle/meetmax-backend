import { BaseQueue } from '@service/queues/base.queue'

import { emailWorker } from '@worker/email.worker'

import { IEmailJob } from '@userFeatures/interfaces/user.interface'

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails')
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail)
    this.processJob('commentsEmail', 5, emailWorker.addNotificationEmail)
    this.processJob('followersEmail', 5, emailWorker.addNotificationEmail)
    this.processJob('reactionsEmail', 5, emailWorker.addNotificationEmail)
    this.processJob('directMessageEmail', 5, emailWorker.addNotificationEmail)
    this.processJob('changePassword', 5, emailWorker.addNotificationEmail)
  }

  public addEmailJobs(name: string, data: IEmailJob): void {
    this.addJob(name, data)
  }
}

export const emailQueue: EmailQueue = new EmailQueue()
