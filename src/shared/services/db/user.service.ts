import { IUserDocument } from '@userFeatures/interfaces/user.interface'
import { UserModel } from '@userFeatures/models/user.schema'

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data)
  }
}

export const userService: UserService = new UserService()
