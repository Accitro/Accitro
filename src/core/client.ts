import Discord from 'discord.js'

import { GlobalConfigManager } from '../resource/manager'
import { Guild, GuildMember, User } from '../resource/data'
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
    this.events = new EventEmitter(this)
    this.on = this.events.on.bind(this.events)
    this.once = this.events.once.bind(this.events)
    this.database = new QueryBuilder(this, databaseCredentials)
    this.logger = new ScopedLogger(new Logger(this), 'main')
    this.modules = new ModuleManager(this)
    this.config = new GlobalConfigManager(this, [])
  }

  public readonly options: ClientOptions
  public readonly discordClient: Discord.Client
  public readonly database: QueryBuilder
  public readonly events: EventEmitter
  public readonly on: EventEmitter['on']
  public readonly once: EventEmitter['once']
  public readonly logger: ScopedLogger
  public readonly modules: ModuleManager
  public readonly config: GlobalConfigManager

  private _application?: Discord.ClientApplication | null
  public async getApplication () {
    if (this._application === undefined) {
      this._application = await this.discordClient.application?.fetch() || null
    }

    return this._application
  }

  public getGuild (guildResolvable: Discord.Guild | string) {
    const { discordClient: { guilds: { cache: discordGuilds } } } = this

    const discordGuild = (() => {
      if (typeof (guildResolvable) !== 'string') {
        return guildResolvable
      }

      return discordGuilds.get(guildResolvable)
    })()

    if (!discordGuild) {
      throw new Error(`Could not find guild #${guildResolvable}`)
    }

    return new Guild(this, discordGuild)
  }

  public getUser (userResolvable: Discord.User | string) {
    const { discordClient: { users: { cache: discordUsers } } } = this
    const discordUser = (() => {
      if (typeof (userResolvable) !== 'string') {
        return userResolvable
      }

      return discordUsers.get(userResolvable)
    })()

    if (!discordUser) {
      throw new Error(`Could not find user #${userResolvable}`)
    }

    return new User(this, discordUser)
  }

  public getGuildMember (guildMemberResolvable: Discord.GuildMember | [string, string]) {
    const { discordClient: { guilds: { cache: discordGuilds } } } = this
    const discordGuildMember = (() => {
      if (!Array.isArray(guildMemberResolvable)) {
        return guildMemberResolvable
      }

      return discordGuilds.get(guildMemberResolvable[0])
        ?.members.cache.get(guildMemberResolvable[1])
    })()

    if (!discordGuildMember) {
      throw new Error(`Could not find guild member #${guildMemberResolvable}`)
    }

    return new GuildMember(this, discordGuildMember)
  }
}
