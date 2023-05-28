import Logger from 'bunyan'

import { environment } from '@root/environment'
import { BaseCache } from '@service/redis/base.cache'

const log: Logger = environment.createLogger('redisConnection')

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection')
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect()
      const res = await this.client.ping()
      log.info(res)
    } catch (error) {
      log.error(error)
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection()
