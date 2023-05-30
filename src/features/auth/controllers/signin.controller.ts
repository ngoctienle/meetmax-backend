import JWT from 'jsonwebtoken'
import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'

import { loginSchema } from '@authFeatures/schemes/signin'

import { IUserDocument } from '@userFeatures/interfaces/user.interface'

import { environment } from '@root/environment'
import { joiValidation } from '@global/decorators/joi-validation.decorator'

import { authService } from '@service/db/auth.service'
import { userService } from '@service/db/user.service'

export class SignIn {
  @joiValidation(loginSchema)
  public async readAccount(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body

    const userExisted = await authService.getAuthUserByUsername(username)
    if (!userExisted) {
      throw new Error('User is not existed!')
    }

    const isPwMatch = await userExisted.comparePassword(password)
    if (!isPwMatch) {
      throw new Error('Your credentials is not valid!')
    }

    const user = await userService.getUserByAuthId(`${userExisted._id}`)
    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: userExisted.uId,
        email: userExisted.email,
        username: userExisted.username,
        avatarColor: userExisted.avatarColor
      },
      environment.JWT_TOKEN!
    )
    req.session = { jwt: userJwt }

    const userDocument: IUserDocument = {
      ...user,
      authId: userExisted!._id,
      username: userExisted!.username,
      email: userExisted!.email,
      avatarColor: userExisted!.avatarColor,
      uId: userExisted!.uId,
      createdAt: userExisted!.createdAt
    } as IUserDocument

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt })
  }
}
