import express, { Router } from 'express'

import { Add } from '@reactionFeatures/controllers/add-reactions.controller'
import { Remove } from '@reactionFeatures/controllers/remove-reaction.controller'
import { Get } from '@reactionFeatures/controllers/get-reaction.controller'

import { authMiddleware } from '@global/helpers/auth-middleware'

class ReactionRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    /* Get Reactions */
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions)
    this.router.get(
      '/post/single/reaction/username/:username/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.singleReactionByUsername
    )
    this.router.get(
      '/post/reactions/username/:username',
      authMiddleware.checkAuthentication,
      Get.prototype.reactionsByUsername
    )

    /* Add Reaction */
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction)

    /* Remove Reaction */
    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    )

    return this.router
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()
