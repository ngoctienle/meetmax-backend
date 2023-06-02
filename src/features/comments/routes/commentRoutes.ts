import express, { Router } from 'express'

import { Get } from '@commentFeatures/controllers/get-comments.controller'
import { Add } from '@commentFeatures/controllers/add-comment.controller'

import { authMiddleware } from '@global/helpers/auth-middleware'

class CommentRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    /* Get Comments */
    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comments)
    this.router.get(
      '/post/commentsnames/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.commentsNamesFromCache
    )
    this.router.get(
      '/post/single/comment/:postId/:commentId',
      authMiddleware.checkAuthentication,
      Get.prototype.singleComment
    )

    /* Add Comment */
    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment)

    return this.router
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes()
