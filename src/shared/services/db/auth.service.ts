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
}

export const authService: AuthService = new AuthService()
