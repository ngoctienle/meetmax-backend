import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { ICommentDocument, ICommentJob } from '@commentFeatures/interfaces/comment.interface'
import { addCommentSchema } from '@commentFeatures/schemes/comment'

import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'

import { joiValidation } from '@global/decorators/joi-validation.decorator'

const commentCache: CommentCache = new CommentCache()

export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body

    const commentObjectId: ObjectId = new ObjectId()
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument

    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData))

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    }
    commentQueue.addCommentJob('addCommentToDB', databaseCommentData)

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' })
  }
}
