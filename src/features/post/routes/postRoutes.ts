import express, { Router } from 'express'

import { Create } from '@postFeatures/controllers/create-post.controller'
import { Get } from '@postFeatures/controllers/get-posts.controller'
import { Delete } from '@postFeatures/controllers/delete-post.controller'
import { Update } from '@postFeatures/controllers/update-post.controller'

import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    /* Create Post */
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post)
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage)
    this.router.post('/post/video/post', authMiddleware.checkAuthentication, Create.prototype.postWithVideo)

    /* Get Posts */
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts)
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages)
    this.router.get('/post/videos/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithVideos)

    /* Delete Post */
    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post)

    /* Updaet Post */
    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.posts)
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage)
    this.router.put('/post/video/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithVideo)

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()
