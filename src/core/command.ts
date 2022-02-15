import Discord from 'discord.js'
import Crypto from 'crypto'
import { Module } from './module'
import { BaseArrayManager } from './base'
import { ScopedLogger } from './logger'

export interface Command {
  data: Discord.ChatInputApplicationCommandData
  run: (logger: ScopedLogger, interaction: Discord.CommandInteraction) => (Promise<Parameters<Discord.CommandInteraction['reply']>[0] | void> | Parameters<Discord.CommandInteraction['reply']>[0] | void)

  defaultAccess:
    (
      {
        directSupport: true
        direct: CommandDirectAccess
      } | {
        directSupport: false
      }
    ) &
    (
      {
        guildSupport: true
        guild: CommandGuildAccess
      } | {
        guildSupport: false
      }
    )
}

export enum CommandGuildAccess {
  Everyone,
  WithRole,
  WithHigherRole,
  Administrator,
  GuildOwner,
  BotOwner
}

export enum CommandDirectAccess {
  Everyone,
  BotOwner
}

export class CommandManager extends BaseArrayManager<Command> {
  public constructor (module: Module) {
    super(module.client)

    this.module = module
  }

  public get commandGuildTable () {
    return this.database.getTableManager('commandGuild')
  }

  public get commandGuildAccessTable () {
    return this.database.getTableManager('commandGuildAccess')
  }

  public get commandDirectTable () {
    return this.database.getTableManager('commandDirect')
  }

  public get commandDirectAccessTable () {
    return this.database.getTableManager('commandDirectAccess')
  }

  public readonly module: Module

  private _logger?: ScopedLogger
  public get logger (): ScopedLogger {
    if (!this._logger) {
      this._logger = this.module.logger.newScope(`Module: ${this.module.name} / Command Manager`)
    }

    return this._logger
  }

  public push (...items: Command[]): number {
    const result = super.push(...items)

    for (const item of items) {
      console.log(item)
      this.logger.log(`Register command: ${item.data.name}`)
    }

    return result
  }

  public getCommand (name: string) {
    return this.find((command) => command.data.name === name)
  }

  public async setGuildAccess (name: string, guildId: string, access: CommandGuildAccess) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}.`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const { commandGuildAccessTable } = this
    if (await commandGuildAccessTable.has({ name, guildId })) {
      await commandGuildAccessTable.alter({ name, guildId }, { access })
    } else {
      await commandGuildAccessTable.insert({ name, guildId, access })
    }
  }

  public async getGuildAccess (name: string, guildId: string): Promise<CommandGuildAccess> {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const result = await this.commandGuildAccessTable.select({ name, guildId }).first()
    return result
      ? result.access
      : command.defaultAccess.guild
  }

  public async resetGuildAccess (name: string, guildId: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    await this.commandGuildAccessTable.drop({ name, guildId })
  }

  public async setDirectAccess (name: string, access: CommandDirectAccess) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on direct.`)
    }

    const { commandDirectAccessTable } = this
    if (await commandDirectAccessTable.has({ name })) {
      await commandDirectAccessTable.alter({ name }, { access })
    } else {
      await commandDirectAccessTable.insert({ name, access })
    }
  }

  public async getDirectAccess (name: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on direct.`)
    }

    const result = await this.commandDirectAccessTable.select({ name }).first()
    return result
      ? result.access
      : command.defaultAccess.direct
  }

  public async resetDirectAccess (name: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on direct.`)
    }

    await this.commandDirectAccessTable.drop({ name })
  }

  public async enableGuild (name: string, guildId: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const { commandGuildTable } = this
    const isEnabled = true
    if (await commandGuildTable.has({ name, guildId })) {
      await commandGuildTable.alter({ name, guildId }, { isEnabled })
    } else {
      await commandGuildTable.drop({ name, guildId })
    }
  }

  public async disableGuild (name: string, guildId: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const { commandGuildTable } = this
    const isEnabled = false
    if (await commandGuildTable.has({ name, guildId })) {
      await commandGuildTable.alter({ name, guildId }, { isEnabled })
    } else {
      await commandGuildTable.drop({ name, guildId })
    }
  }

  public async isGuildEnabled (name: string, guildId: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.guildSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const result = await this.commandGuildTable.select({ name, guildId }).first()
    return result ? !!result.isEnabled : true
  }

  public async enableDirect (name: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on direct.`)
    }

    const { commandDirectTable } = this
    const isEnabled = true

    if (await commandDirectTable.has({ name })) {
      await commandDirectTable.alter({ name }, { isEnabled })
    } else {
      await commandDirectTable.insert({ name, isEnabled })
    }
  }

  public async disableDirect (name: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on direct.`)
    }

    const { commandDirectTable } = this
    const isEnabled = false

    if (await commandDirectTable.has({ name })) {
      await commandDirectTable.alter({ name }, { isEnabled })
    } else {
      await commandDirectTable.insert({ name, isEnabled })
    }
  }

  public async isDirectEnabled (name: string) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work on guild.`)
    }

    const result = await this.commandDirectTable.select({ name }).first()
    return result ? !!result.isEnabled : true
  }
}

export const getCommandOptionFootprint = (data: Discord.ApplicationCommandOption | Discord.ApplicationCommandOptionData, footprint: Crypto.Hash) => {
  footprint
    .update(data.name)
    .update(data.description)
    .update(`${data.type}`)

  if (
    (data.type === 'SUB_COMMAND') ||
    (data.type === 'SUB_COMMAND_GROUP')
  ) {
    for (const option of (data.options || [])) {
      getCommandOptionFootprint(option, footprint)
    }
  }

  return footprint
}

export const getCommandFootprint = (data: Discord.ApplicationCommand | Command['data'], footprint: Crypto.Hash = Crypto.createHash('sha256')) => {
  footprint
    .update(data.name)
    .update(data.description)
    .update(`${data.type}`)

  for (const option of (data.options || [])) {
    getCommandOptionFootprint(option, footprint)
  }

  return footprint
}
