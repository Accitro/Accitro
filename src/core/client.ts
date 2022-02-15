import Discord from 'discord.js'
import { DatabaseCredentials, QueryBuilder } from '../database/query-builder'
import { EventEmitter } from './events'
import { ModuleManager } from './module'

export interface ClientOptions {
}

export class Client {
  public static defaultOptions: ClientOptions = {
  }

  public constructor (client: Discord.Client, databaseCredentials: DatabaseCredentials, options?: Partial<ClientOptions>) {
    this.options = Object.assign(Client.defaultOptions, options)
    this.discordClient = client
    this.database = new QueryBuilder(this, databaseCredentials)
    this.events = new EventEmitter(this)
    this.modules = new ModuleManager(this)

    this.on = this.events.on.bind(this.events)
    this.once = this.events.once.bind(this.events)
  }

  public readonly options: ClientOptions
  public readonly discordClient: Discord.Client
  public readonly database: QueryBuilder
  public readonly events: EventEmitter
  public readonly modules: ModuleManager

  public readonly on: EventEmitter['on']
  public readonly once: EventEmitter['once']
}
