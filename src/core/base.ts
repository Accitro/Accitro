import { QueryBuilder } from '../database/query-builder'
import { Client } from './client'

export class BaseClass extends (class {}) {
  public constructor (client: Client) {
    super()

    this.client = client
  }

  public readonly client: Client
}

export class BaseArrayManager <T> extends Array<T> {
  public constructor (client: Client) {
    super()

    this.client = client
    this.database = client.database
  }

  public readonly client: Client
  public readonly database: QueryBuilder
}
