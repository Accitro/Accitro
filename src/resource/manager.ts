import Discord from 'discord.js'
import Path from 'path'

import { Client } from '../core/client'
import { QueryBuilder } from '../database/query-builder'
import { Guild, GuildMember, User } from './data'

export class BaseManager {
  public constructor (client: Client) {
    this.client = client
    this.database = client.database
  }

  public readonly client: Client
  public readonly database: QueryBuilder
}

export class GlobalConfigManager extends BaseManager {
  public constructor (client: Client, context: Array<string>) {
    super(client)

    this.context = context
  }

  public readonly context: Array<string>

  public get globalConfigTable () {
    return this.database.getTableManager('globalConfig')
  }

  public newContext (context: Array<string>) {
    return new GlobalConfigManager(this.client, [...this.context, ...context])
  }

  public async getKey (name: string) {
    return Path.join(...this.context, name)
  }

  public async get (name: string, defaultValue?: any) {
    const { globalConfigTable } = this
    const key = this.getKey(name)

    const result = await globalConfigTable.select({ key }).first()
    return result
      ? JSON.parse(result.value)
      : defaultValue !== undefined
        ? await (async (value) => {
          await globalConfigTable.insert({ key, value: JSON.stringify(value) })

          return value
        })(typeof (defaultValue) === 'function' ? await defaultValue() : defaultValue)
        : undefined
  }

  public async set (name: string, value: any) {
    const { globalConfigTable } = this
    const key = this.getKey(name)

    if (await globalConfigTable.has({ key })) {
      await globalConfigTable.alter({ key }, { value: JSON.stringify(value) })
    } else {
      await globalConfigTable.insert({ key, value: JSON.stringify(value) })
    }
  }

  public async has (name: string) {
    return await this.globalConfigTable.has({ key: this.getKey(name) })
  }

  public async unset (name: string) {
    await this.globalConfigTable.drop({ key: this.getKey(name) })
  }
}

export class BaseConfigManager<T extends 'guild' | 'user'> extends BaseManager {
  public constructor (client: Client, type: T, id: string, context: Array<string>) {
    super(client)

    this.type = type
    this.id = id
    this.context = context
  }

  public readonly type: T
  public readonly id: string
  public readonly context: Array<string>

  public get guildConfigTable () {
    return this.database.getTableManager('guildConfig')
  }

  public get userConfigTable () {
    return this.database.getTableManager('userConfig')
  }

  public get configTable () {
    return this.type === 'guild' ? this.guildConfigTable : this.userConfigTable
  }

  public newContext (context: Array<string>) {
    return new BaseConfigManager(this.client, this.type, this.id, [...this.context, ...context])
  }

  public async getKey (name: string) {
    return Path.join(...this.context, name)
  }

  public async get (name: string, defaultValue?: any) {
    const { configTable, id } = this
    const key = this.getKey(name)

    const result = await configTable.select({ id, key }).first()
    return result
      ? JSON.parse(result.value)
      : defaultValue !== undefined
        ? await (async (value) => {
          await configTable.insert({ id, key, value: JSON.stringify(value) })

          return value
        })(typeof (defaultValue) === 'function' ? await defaultValue() : defaultValue)
        : undefined
  }

  public async set (name: string, value: any) {
    const { configTable, id } = this
    const key = this.getKey(name)

    if (await configTable.has({ id, key })) {
      await configTable.alter({ id, key }, { value: JSON.stringify(value) })
    } else {
      await configTable.insert({ id, key, value: JSON.stringify(value) })
    }
  }

  public async has (name: string) {
    const { configTable, id } = this
    const key = this.getKey(name)

    return await configTable.has({ id, key })
  }

  public async unset (name: string) {
    const { configTable, id } = this
    const key = this.getKey(name)

    await configTable.drop({ id, key })
  }
}

export class DataManager extends BaseManager {
  public get (guild: Discord.Guild) {
    return new Guild(this.client, guild)
  }
}

export class GuildConfigManager extends BaseConfigManager<'guild'> {
  public constructor (guild: Guild, context: Array<string>) {
    super(guild.client, 'guild', guild.discordGuild.id, context)

    this.guild = guild
  }

  public newContext (context: string[]): BaseConfigManager<'guild'> {
    return new GuildConfigManager(this.guild, [...this.context, ...context])
  }

  public readonly guild: Guild
}

export class UserConfigManager extends BaseConfigManager<'user'> {
  public constructor (user: User, context: Array<string>) {
    super(user.client, 'user', user.discordUser.id, context)

    this.user = user
  }

  public newContext (context: string[]): BaseConfigManager<'user'> {
    return new UserConfigManager(this.user, [...this.context, ...context])
  }

  public readonly user: User
}

export class GuildMemberConfigManager extends BaseConfigManager<'guild'> {
  public constructor (guildMember: GuildMember, context: Array<string>) {
    super(guildMember.client, 'guild', guildMember.discordGuildMember.guild.id, [`member/${guildMember.discordGuildMember.id}`, ...context])

    this.guildMember = guildMember
  }

  public readonly guildMember: GuildMember
}
