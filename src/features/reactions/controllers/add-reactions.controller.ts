import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { addReactionSchema } from '@reactionFeatures/schemes/reactions'
import { IReactionDocument, IReactionJob } from '@reactionFeatures/interfaces/reaction.interface'

import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'

import { joiValidation } from '@global/decorators/joi-validation.decorator'

const reactionCache: ReactionCache = new ReactionCache()

export class Add {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body

    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture
    } as IReactionDocument

    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction)

    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    }
    reactionQueue.addReactionJob('addReactionToDB', databaseReactionData)

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' })
  }
}
