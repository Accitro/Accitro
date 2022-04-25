import { QueryBuilder } from '../database/query-builder'
import { Client } from './client'

export class BaseClass extends (class {}) {
  public constructor (client: Client) {
    super()

    this.client = client
  }

  public readonly client: Client
}

export class BaseArrayManager<T> {
  public constructor (client: Client) {
    this.client = client
    this.database = client.database
    this.entries = []
  }

  public readonly client: Client
  public readonly database: QueryBuilder
  public readonly entries: Array<T>
}
