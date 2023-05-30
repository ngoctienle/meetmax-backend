import JWT from 'jsonwebtoken'
import HTTP_STATUS from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { UploadApiResponse } from 'cloudinary'
import { Request, Response } from 'express'

import { IAuthDocument, ISignUpData } from '@authFeatures/interfaces/auth.interface'
import { signUpSchema } from '@authFeatures/schemes/signup'

import { IUserDocument } from '@userFeatures/interfaces/user.interface'

import { environment } from '@root/environment'
import { joiValidation } from '@global/decorators/joi-validation.decorator'
import { uploads } from '@global/helpers/cloudinary-upload'
import { Utils } from '@global/helpers/utils'

import { UserCache } from '@service/redis/user.cache'
import { authService } from '@service/db/auth.service'
import { authQueue } from '@service/queues/auth.queue'
import { userQueue } from '@service/queues/user.queue'

const userCache: UserCache = new UserCache()

export class SignUp {
  @joiValidation(signUpSchema)
  public async createAccount(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body

    const isUserExisted = await authService.getUserByUsernameOrEmail(username, email)
    if (isUserExisted) {
      throw new Error('User already existed!')
    }

    const authObjectId = new ObjectId()
    const userObjectId = new ObjectId()
    const uId = `${Utils.generateRandomIntegers(12)}`

    const authSignUpData: IAuthDocument = SignUp.prototype.createSignUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    })

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse
    if (!result?.public_id) {
      throw new Error('Failed to upload avatar image. Try again!')
    }

    /* Add To Redis */
    const userDataForCache = SignUp.prototype.createUserData(authSignUpData, userObjectId)
    userDataForCache.profilePicture = `https://res.cloudinary.com/dhf8ggev3/image/upload/v${result.version}/${userObjectId}`
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache)

    /* Add To DB */
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authSignUpData })
    userQueue.addUserJob('addUserToDB', { value: userDataForCache })

    const userJwt: string = SignUp.prototype.signToken(authSignUpData, userObjectId)
    req.session = { jwt: userJwt }

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'User created successfully', user: userDataForCache, token: userJwt })
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      environment.JWT_TOKEN!
    )
  }

  private createSignUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data

    return {
      _id,
      uId,
      username: Utils.firstLetterUppercase(username),
      email: Utils.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument
  }

  private createUserData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Utils.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument
  }
}
