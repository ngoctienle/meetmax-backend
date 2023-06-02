import { BaseQueue } from '@service/queues/base.queue'

import { ICommentJob } from '@commentFeatures/interfaces/comment.interface'

import { commentWorker } from '@worker/comment.worker'

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments')
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB)
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data)
  }
}

export const commentQueue: CommentQueue = new CommentQueue()