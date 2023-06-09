import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'

import { IUserDocument } from '@userFeatures/interfaces/user.interface'

import { UserCache } from '@service/redis/user.cache'
import { userService } from '@service/db/user.service'

const userCache: UserCache = new UserCache()

export class CurrentUser {
  public async readUser(req: Request, res: Response): Promise<void> {
    let isUser = false
    let token = null
    let user = null
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`)
    if (Object.keys(existingUser).length) {
      isUser = true
      token = req.session?.jwt
      user = existingUser
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user })
  }
}
