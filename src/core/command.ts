import Discord from 'discord.js'
import { Module, ModuleManager } from './module'
import { BaseArrayManager, BaseClass } from './base'
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

  public add (...entries: Array<Command>) {
    this.entries.push(...entries)

    for (const entry of entries) {
      this.logger.log(`Register command: ${entry.data.name}`)
    }
  }

  public getCommand (name: string) {
    return this.entries.find((command) => command.data.name === name)
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
      throw new Error(`Command "${name}" does not work in guilds.`)
    }

    await this.commandGuildAccessTable.drop({ name, guildId })
  }

  public async setDirectAccess (name: string, access: CommandDirectAccess) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`Command missing: ${name}`)
    } else if (!command.defaultAccess.directSupport) {
      throw new Error(`Command "${name}" does not work in dms.`)
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

export const getCommandOptionFootprint = (data: Discord.ApplicationCommandOption | Discord.ApplicationCommandOptionData, footprint: string = '') => {
  footprint += data.name
  footprint += data.description
  footprint += data.type
  footprint += (<any> data).required || false
  footprint += (<Array<any>> (<any> data).choices || []).map(({ name, value }) => `${name}=${value}`).join()

  return footprint
}

export const getCommandFootprint = (data: Discord.ApplicationCommand | Command['data'], footprint: string = '') => {
  footprint += data.name
  footprint += data.description
  footprint += data.type || 'CHAT_INPUT'

  for (const option of data.options || []) {
    footprint += getCommandFootprint(<any> option, footprint)
  }

  return footprint
}

export class CommandError extends Error {
  public constructor (message: Error | string, type: 'Permission' | 'Input' | 'Internal') {
    const { errorMessage, errorStack } = message instanceof Error
      ? { errorMessage: message.message, errorStack: message.stack }
      : { errorMessage: message, errorStack: undefined }

    super(errorMessage)

    this.name = `${type} Error`
    this.stack = errorStack || this.stack
  }
}

export class CommandRunner extends BaseClass {
  public constructor (moduleManager: ModuleManager) {
    super(moduleManager.client)

    this.logger = moduleManager.logger.newScope('CommandRunner')
    this.moduleManager = moduleManager
    this.timeouts = {}
    this.commandList = {}
  }

  public readonly logger: ScopedLogger
  public readonly moduleManager: ModuleManager
  public readonly timeouts: { [key: string]: number }
  public readonly commandList: {
    [key: string]: {
      module: Module,
      command: Command
    }
  }

  public getTimeout (userId: string) {
    return this.timeouts[userId] || 0
  }

  public setTimeout (userId: string, time: number) {
    this.timeouts[userId] = time
  }

  public async publishCommands (entryList: { [key: string]: { module: Module, command: Command } }, application: Discord.ClientApplication) {
    const { logger } = this

    const commandMap: {
      [key: string]: {
        local?: { module: Module, command: Command }
        remote?: Discord.ApplicationCommand<{ guild: Discord.GuildResolvable }> & { type: 'CHAT_INPUT' }
      }
    } = {}

    for (const entryKey in entryList) {
      const { command, module } = entryList[entryKey]

      if (!(command.data.name in commandMap)) {
        commandMap[command.data.name] = {}
      }

      commandMap[command.data.name].local = { command, module }
    }

    for (const [, command] of await application.commands.fetch()) {
      if (!(command.name in commandMap)) {
        commandMap[command.name] = {}
      }

      if (command.type === 'CHAT_INPUT') {
        commandMap[command.name].remote = <any> command
      }
    }

    for (const mapKey in commandMap) {
      const { local, remote } = commandMap[mapKey]

      if (local && (!remote)) {
        await application.commands.create(local.command.data)
        logger.log(`Set chat input interaction command "${local.command.data.name}" to Discord.`)
      } else if (remote && (!local)) {
        await application.commands.delete(remote.id)
        logger.log(`Delete chat input interaction command "${remote.name}" from Discord.`)
      } else if (remote && local) {
        const remoteFootprint = getCommandFootprint(remote)
        const localFootprint = getCommandFootprint(local.command.data)

        if (remoteFootprint !== localFootprint) {
          await application.commands.edit(remote.id, local.command.data)
          logger.log(`Update chat input interaction command "${remote.name}" on Discord.`)
        }
      }
    }
  }

  public async init () {
    const { commandList, client } = this
    const application = await this.client.getApplication()
    if (!application) {
      throw new Error('Discord application not available')
    }

    await Promise.all(this.moduleManager.entries.map(async (module) => {
      const { commands } = module

      await Promise.all(commands.entries.map(async (command) => {
        if (command.data.name in commandList) {
          throw new Error(`Command name ambiguity detected: ${command.data.name}`)
        }

        commandList[command.data.name] = { module, command }
      }))
    }))

    await this.publishCommands(commandList, application)
    client.on('interaction', (interaction) => this.run(interaction))
  }

  public async checkPermissions (interaction: Discord.Interaction, application: Discord.ClientApplication, command: Command, module: Module, user: Discord.User) {
    const { client } = this
    const { guildId } = interaction

    if (guildId) {
      if (!await module.commands.isGuildEnabled(command.data.name, guildId)) {
        throw new CommandError('Command is disabled in guilds.', 'Permission')
      }

      const guild = client.discordClient.guilds.cache.get(guildId)
      if (!guild) {
        throw new CommandError('Cannot fetch guild.', 'Permission')
      }

      const member = guild.members.cache.get(user.id)
      if (!member) {
        throw new CommandError('Cannot fetch member.', 'Internal')
      }

      const meMember = guild.me
      if (!meMember) {
        throw new CommandError('Cannot fetch bot member.', 'Internal')
      }

      const guildAccess = await module.commands.getGuildAccess(command.data.name, guildId)
      if (guildAccess <= CommandGuildAccess.BotOwner) {
        if (application.owner instanceof Discord.Team) {
          if (!application.owner.members.find((teamMember) => teamMember.id === member.id)) {
            if (guildAccess === CommandGuildAccess.BotOwner) {
              throw new CommandError('User must be one of the bot owners.', 'Permission')
            }
          } else {
            return
          }
        } else if (application.owner instanceof Discord.User) {
          if (application.owner.id !== member.id) {
            if (guildAccess === CommandGuildAccess.BotOwner) {
              throw new CommandError('User must be the bot owner.', 'Permission')
            }
          } else {
            return
          }
        } else {
          if (guildAccess >= CommandGuildAccess.BotOwner) {
            throw new CommandError('Cannot fetch discord application.', 'Internal')
          }
        }
      }

      if (guildAccess <= CommandGuildAccess.GuildOwner) {
        if (guild.ownerId !== member.id) {
          if (guildAccess >= CommandGuildAccess.GuildOwner) {
            throw new CommandError('User must be the guild owner.', 'Permission')
          }
        } else {
          return
        }
      }

      if (guildAccess <= CommandGuildAccess.Administrator) {
        if (!member.permissions.has('ADMINISTRATOR')) {
          if (guildAccess >= CommandGuildAccess.Administrator) {
            throw new CommandError('User must be an administrator.', 'Permission')
          }
        } else {
          return
        }
      }

      if (guildAccess <= CommandGuildAccess.WithHigherRole) {
        if (member.roles.highest.position < meMember.roles.highest.position) {
          if (guildAccess >= CommandGuildAccess.WithHigherRole) {
            throw new CommandError('User must have at least one role that is higher than the bot role.', 'Permission')
          }
        } else {
          return
        }
      }

      if (guildAccess <= CommandGuildAccess.WithRole) {
        if (member.roles.highest.id === guild.id) {
          if (guildAccess >= CommandGuildAccess.WithRole) {
            throw new CommandError('User must have at least one role.', 'Permission')
          }
        }
      }
    } else {
      if (!await module.commands.isDirectEnabled(command.data.name)) {
        throw new CommandError('Command is disabled in dms.', 'Permission')
      }

      const directAccess = await module.commands.getDirectAccess(command.data.name)
      if (directAccess <= CommandDirectAccess.BotOwner) {
        if (application.owner instanceof Discord.Team) {
          if (!application.owner.members.find((teamMember) => teamMember.id === user.id)) {
            if (directAccess >= CommandDirectAccess.BotOwner) {
              throw new CommandError('User must be one of the bot owners.', 'Permission')
            }
          }
        } else if (application.owner instanceof Discord.User) {
          if (application.owner.id !== user.id) {
            if (directAccess >= CommandDirectAccess.BotOwner) {
              throw new CommandError('User must be the bot owner.', 'Permission')
            }
          }
        } else {
          if (directAccess >= CommandDirectAccess.BotOwner) {
            throw new CommandError('Cannot fetch discord application.', 'Internal')
          }
        }
      }
    }
  }

  public async run (interaction: Discord.Interaction) {
    const { commandList, client, logger } = this
    const application = await client.getApplication()
    if (!application) {
      throw new Error('Discord application not available')
    } else if (!interaction.isCommand()) {
      return
    }

    const respond = (data: Discord.InteractionReplyOptions) => {
      if (interaction.replied || interaction.deferred) {
        return interaction.editReply(data)
      } else {
        return interaction.reply(data)
      }
    }

    const run = async () => {
      const guildId = interaction.guildId || undefined
      const { command, module } = commandList[interaction.commandName] || {}
      const user = interaction.user
      const me = client.discordClient.user

      logger.log(`User ${user.id} invoked /${command.data.name} command.`)
      if (!(command && module)) {
        throw new CommandError('Cannot fetch command.', 'Internal')
      } else if (!await module.isEnabled(guildId)) {
        throw new CommandError('Module is disabled.', 'Permission')
      } else if (!me) {
        throw new CommandError('Cannot fetch bot user.', 'Internal')
      }

      try {
        const { defaultAccess } = command

        if (interaction.guildId) {
          if (!defaultAccess.guildSupport) {
            throw new CommandError('This command does not work in guilds.', 'Permission')
          }
        } else {
          if (!defaultAccess.directSupport) {
            throw new CommandError('This command does not work in dms.', 'Permission')
          }
        }
      } catch (error) {
        logger.log(`User ${user.id} tried to invoke /${command.data.name} in ${interaction.guildId ? 'a guild' : 'dms'} where it doesn't work.`)
        throw error
      }

      try {
        await this.checkPermissions(interaction, application, command, module, user)
      } catch (error) {
        logger.log(`User ${user.id} did not have enough permission to run /${command.data.name} command.`)
        throw error
      }

      try {
        return await command.run(module.commands.logger.newScope(`Module: ${module.name} / Command: ${command.data.name}`), interaction)
      } catch (error) {
        logger.log(`An error occured when user ${user.id} invoked /${command.data.name} command.`)
        throw error
      }
    }

    const result = await (async () => {
      try {
        return await run()
      } catch (originalError: any) {
        let error = originalError
        if (!(error instanceof CommandError)) {
          error = new CommandError(error, 'Internal')
        }

        this.logger.error(error)
        return {
          ephemeral: true,
          embeds: [
            {
              title: `Fatal: ${error.name}`,
              description: [
                error.message,
                '```plain',
                ...error.stack.split('\n').slice(1),
                '```'
              ].join('\n')
            }
          ]
        }
      }
    })()
    result && await respond(<any> result).catch((error) => this.logger.error(error))
  }
}
