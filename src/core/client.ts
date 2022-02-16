import Discord from 'discord.js'
import { DatabaseCredentials, QueryBuilder } from '../database/query-builder'
import { EventEmitter } from './events'
import { Logger, ScopedLogger } from './logger'
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
    this.on = this.events.on.bind(this.events)
    this.once = this.events.once.bind(this.events)
    this.logger = new ScopedLogger(new Logger(this), 'main')
    this.modules = new ModuleManager(this)
  }

  public readonly options: ClientOptions
  public readonly discordClient: Discord.Client
  public readonly database: QueryBuilder
  public readonly events: EventEmitter
  public readonly on: EventEmitter['on']
  public readonly once: EventEmitter['once']
  public readonly logger: ScopedLogger
  public readonly modules: ModuleManager
}
