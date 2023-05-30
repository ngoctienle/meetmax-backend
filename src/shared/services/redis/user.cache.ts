import Logger from 'bunyan'

import { IUserDocument } from '@userFeatures/interfaces/user.interface'

import { environment } from '@root/environment'
import { Utils } from '@global/helpers/utils'
import { ServerError } from '@global/helpers/error-handler'

import { BaseCache } from '@service/redis/base.cache'

const log: Logger = environment.createLogger('userCache')

export class UserCache extends BaseCache {
  constructor() {
    super('userCache')
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date()
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser

    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    }

    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }

      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` })
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`)
      }
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again')
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument
      response.createdAt = new Date(Utils.parseJson(`${response.createdAt}`))
      response.postsCount = Utils.parseJson(`${response.postsCount}`)
      response.blocked = Utils.parseJson(`${response.blocked}`)
      response.blockedBy = Utils.parseJson(`${response.blockedBy}`)
      response.notifications = Utils.parseJson(`${response.notifications}`)
      response.social = Utils.parseJson(`${response.social}`)
      response.followersCount = Utils.parseJson(`${response.followersCount}`)
      response.followingCount = Utils.parseJson(`${response.followingCount}`)
      response.bgImageId = Utils.parseJson(`${response.bgImageId}`)
      response.bgImageVersion = Utils.parseJson(`${response.bgImageVersion}`)
      response.profilePicture = Utils.parseJson(`${response.profilePicture}`)
      response.work = Utils.parseJson(`${response.work}`)
      response.school = Utils.parseJson(`${response.school}`)
      response.location = Utils.parseJson(`${response.location}`)
      response.quote = Utils.parseJson(`${response.quote}`)

      return response
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again')
    }
  }
}
