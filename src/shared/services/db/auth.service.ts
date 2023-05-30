import { IAuthDocument } from '@authFeatures/interfaces/auth.interface'
import { AuthModel } from '@authFeatures/models/auth.schema'

import { Utils } from '@global/helpers/utils'

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data)
  }
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    try {
      const query = {
        $or: [{ username: Utils.firstLetterUppercase(username) }, { email: Utils.lowerCase(email) }]
      }
      const user = await AuthModel.findOne<IAuthDocument>(query).exec()

      return user
    } catch (error) {
      throw new Error('Failed to get User by USERNAME or EMAIL!')
    }
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Utils.firstLetterUppercase(username)
    }).exec()) as IAuthDocument

    return user
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Utils.lowerCase(email)
    }).exec()) as IAuthDocument

    return user
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      {
        _id: authId
      },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    )
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument

    return user
  }
}

export const authService: AuthService = new AuthService()
