import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'

import { environment } from '@root/environment'

import { postService } from '@service/db/post.service'

const log: Logger = environment.createLogger('postWorker')

class PostWorker {
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      /* Add method to send data to database */
      await postService.addPostToDB(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data
      await postService.deletePost(keyOne, keyTwo)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updatePostInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await postService.editPost(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const postWorker: PostWorker = new PostWorker()
