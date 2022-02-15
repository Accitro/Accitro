import Discord from 'discord.js'

import { BaseClass } from '../core/base'
import { Client } from '../core/client'
import { GuildConfigManager, GuildMemberConfigManager, UserConfigManager } from './manager'

export class Guild extends BaseClass {
  public constructor (client: Client, discordGuild: Discord.Guild) {
    super(client)

    this.discordGuild = discordGuild
    this.config = new GuildConfigManager(this, [])
  }

  public readonly discordGuild: Discord.Guild
  public readonly config: GuildConfigManager
}

export class User extends BaseClass {
  public constructor (client: Client, discordUser: Discord.User) {
    super(client)

    this.discordUser = discordUser
    this.config = new UserConfigManager(this, [])
  }

  public readonly discordUser: Discord.User
  public readonly config: UserConfigManager
}

export class GuildMember extends BaseClass {
  public constructor (client: Client, discordGuildMember: Discord.GuildMember) {
    super(client)

    this.discordGuildMember = discordGuildMember
    this.config = new GuildMemberConfigManager(this, [])
  }

  public readonly discordGuildMember: Discord.GuildMember
  public readonly config: GuildMemberConfigManager
}
