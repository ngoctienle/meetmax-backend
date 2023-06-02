import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'

import { environment } from '@root/environment'

import { commentService } from '@service/db/comment.service'

const log: Logger = environment.createLogger('commentWorker')

class CommentWorker {
  async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await commentService.addCommentToDB(data)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker()
