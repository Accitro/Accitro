import Discord from 'discord.js'

import { BaseArrayManager, BaseClass } from './base'
import { Client } from './client'
import { Command, CommandDirectAccess, CommandGuildAccess, CommandManager, getCommandFootprint } from './command'
import { ClientEvents, EventEmitter } from './events'
import { ScopedLogger } from './logger'

export abstract class Module extends BaseClass {
  public constructor (manager: ModuleManager) {
    super(manager.client)

    this.moduleManager = manager
    this.commands = new CommandManager(this)
    this.eventListeners = <this['eventListeners']> {}
  }

  public readonly moduleManager: ModuleManager

  private _logger?: ScopedLogger
  public get logger () {
    if (!this._logger) {
      this._logger = this.moduleManager.logger.newScope(`Module: ${this.name}`)
    }

    return this._logger
  }

  public abstract readonly name: string
  public abstract readonly description: string
  public readonly commands: CommandManager
  public readonly eventListeners: {
    [Property in keyof ClientEvents]: (...args: ClientEvents[Property]) => (void | Promise<void>)
  }

  public enable () {
    return this.moduleManager.enable(this.name)
  }

  public disable () {
    return this.moduleManager.disable(this.name)
  }

  public isEnabled (guildId?: string) {
    return this.moduleManager.isEnabled(this.name, guildId)
  }

  public setGuildOverride (guildId: string, isEnabled: boolean) {
    return this.moduleManager.setGuildOverride(this.name, guildId, isEnabled)
  }

  public unsetGuildOverride (guildId: string) {
    return this.moduleManager.unsetGuildOverride(this.name, guildId)
  }
}

export class ModuleManager extends BaseArrayManager<Module> {
  public static bindEventEmitter (modules: ModuleManager, eventEmitter: EventEmitter) {
    const oldEmit = <any> eventEmitter.emit
    const newEmit = <any> ((name: string, ...args: Array<any>) => {
      for (const module of modules) {
        const listener = (<any> module.eventListeners)[name]

        if (listener) {
          listener.call(module, ...args)
        }
      }
    })

    eventEmitter.emit = <any> ((...args: Array<any>): boolean => {
      oldEmit.call(eventEmitter, ...args)
      newEmit.call(modules, ...args)

      return true
    })
  }

  public constructor (client: Client) {
    super(client)

    ModuleManager.bindEventEmitter(this, client.events)
    this.logger = client.logger.newScope('Module Manager')
  }

  public get moduleTable () {
    return this.database.getTableManager('module')
  }

  public get moduleGuildOverrideTable () {
    return this.database.getTableManager('moduleGuildOverride')
  }

  public readonly logger: ScopedLogger

  public async publishCommands (entryList: { [key: string]: { module: Module, command: Command } }, application: Discord.ClientApplication) {
    const commandMap: {
      [key: string]: {
        local?: Command
        remote?: Discord.ApplicationCommand<{ guild: Discord.GuildResolvable }> & { type: 'CHAT_INPUT' }
      }
    } = {}

    for (const entryKey in entryList) {
      const { command } = entryList[entryKey]

      if (!(command.data.name in commandMap)) {
        commandMap[command.data.name] = {}
      }

      commandMap[command.data.name].local = command
    }

    for (const [, command] of application.commands.cache) {
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
        await application.commands.create(local.data)
      } else if (remote && (!local)) {
        application.commands.delete(remote.name)
      } else if (remote && local) {
        const remoteFootprint = getCommandFootprint(remote)
        const localFootprint = getCommandFootprint(local.data)

        if (remoteFootprint !== localFootprint) {
          await application.commands.edit(remote.name, local.data)
        }
      }
    }
  }

  public async init () {
    const { client } = this

    const application = await this.getApplication()
    if (!application) {
      throw new Error('Discord application not available')
    }

    const entryList: {
      [key: string]: {
        module: Module,
        command: Command
      }
    } = {}

    await this.publishCommands(entryList, application)
    await Promise.all(this.map(async (module) => {
      const { commands } = module

      await Promise.all(commands.map(async (command) => {
        if (command.data.name in entryList) {
          throw new Error(`Command name ambiguity detected: ${command.data.name}`)
        }
      }))
    }))

    client.on('interaction', async (interaction) => {
      if (!interaction.isCommand()) {
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
        const entry = entryList[interaction.commandName]
        if (!entry) {
          throw new Error('Cannot fetch command.')
        }

        const user = interaction.user
        const me = client.discordClient.user
        const { command, module } = entry

        if (!await module.isEnabled(guildId)) {
          throw new Error('Module is disabled.')
        } else if (!me) {
          throw new Error('Cannot fetch bot user.')
        }

        if (guildId) {
          if (!await module.commands.isGuildEnabled(command.data.name, guildId)) {
            throw new Error('Command is disabled on guilds.')
          }

          const guild = client.discordClient.guilds.cache.get(guildId)
          if (!guild) {
            throw new Error('Cannot fetch guild.')
          }

          const member = guild.members.cache.get(user.id)
          if (!member) {
            throw new Error('Cannot fetch member.')
          }

          const meMember = guild.me
          if (!meMember) {
            throw new Error('Cannot fetch bot member.')
          }

          switch (await module.commands.getGuildAccess(command.data.name, guildId)) {
            case CommandGuildAccess.WithRole:
              if (member.roles.highest.id === guild.id) {
                throw new Error('User must have at least one role.')
              }
              break

            case CommandGuildAccess.WithHigherRole:
              if (member.roles.highest.position < meMember.roles.highest.position) {
                throw new Error('User must have at list one role that is higher than the bot role.')
              }
              break

            case CommandGuildAccess.Administrator:
              if (!member.permissions.has('ADMINISTRATOR')) {
                throw new Error('User must be an administrator.')
              }
              break

            case CommandGuildAccess.GuildOwner:
              if (guild.ownerId !== member.id) {
                throw new Error('User must be the guild owner.')
              }
              break

            case CommandGuildAccess.BotOwner:
              if (application.owner instanceof Discord.Team) {
                if (!application.owner.members.find((teamMember) => teamMember.id === member.id)) {
                  throw new Error('User must be one of the bot owners.')
                }
              } else if (application.owner instanceof Discord.User) {
                if (application.owner.id !== member.id) {
                  throw new Error('User must be the bot owner.')
                }
              } else {
                throw new Error('Cannot fetch discord application.')
              }
              break
          }
        } else {
          if (!await module.commands.isDirectEnabled(command.data.name)) {
            throw new Error('Command is disabled on direct.')
          }

          switch (await module.commands.getDirectAccess(command.data.name)) {
            case CommandDirectAccess.BotOwner:
              if (application.owner instanceof Discord.Team) {
                if (!application.owner.members.find((teamMember) => teamMember.id === user.id)) {
                  throw new Error('User must be one of the bot owners.')
                }
              } else if (application.owner instanceof Discord.User) {
                if (application.owner.id !== user.id) {
                  throw new Error('User must be the bot owner.')
                }
              } else {
                throw new Error('Cannot fetch discord application.')
              }
              break
          }
        }

        return await command.run(module.commands.logger.newScope(`Module: ${module.name} / Command: ${command.data.name}`), interaction)
      }

      let result: Parameters<Discord.CommandInteraction['reply']>[0]
      try {
        result = await run()
      } catch (error: any) {
        console.error(this.logger.error(error))
        result = {
          ephemeral: true,
          embeds: [
            {
              title: 'Fatal Error',
              description: `${error.message}`
            }
          ]
        }
      }

      await respond(<any> result).catch((error) => this.logger.error(error))
    })
  }

  public push (...items: Module[]): number {
    const result = super.push(...items)

    for (const item of items) {
      this.logger.log(`Register module: ${item.name}`)
    }

    return result
  }

  private _application?: Discord.ClientApplication | null
  public async getApplication () {
    if (this._application === undefined) {
      this._application = await this.client.discordClient.application?.fetch() || null
    }

    return this._application
  }

  public async enable (name: string) {
    const { moduleTable } = this
    const isEnabled = true

    if (await moduleTable.has({ name })) {
      await moduleTable.alter({ name }, { isEnabled })
    } else {
      await moduleTable.insert({ name, isEnabled })
    }
  }

  public async disable (name: string) {
    const { moduleTable } = this
    const isEnabled = false

    if (await moduleTable.has({ name })) {
      await moduleTable.alter({ name }, { isEnabled })
    } else {
      await moduleTable.insert({ name, isEnabled })
    }
  }

  public async isEnabled (name: string, guildId?: string) {
    if (guildId) {
      const result = await this.moduleGuildOverrideTable.select({ name }).first()

      if (result) {
        return !!result.enabled
      }
    }

    const result = await this.moduleTable.select({ name }).first()
    return result ? !!result.enabled : true
  }

  public async setGuildOverride (name: string, guildId: string, isEnabled: boolean) {
    const { moduleGuildOverrideTable } = this

    if (await moduleGuildOverrideTable.has({ name, guildId })) {
      await moduleGuildOverrideTable.alter({ name, guildId }, { isEnabled })
    } else {
      await moduleGuildOverrideTable.insert({ name, guildId, isEnabled })
    }
  }

  public async unsetGuildOverride (name: string, guildId: string) {
    const { moduleGuildOverrideTable } = this

    await moduleGuildOverrideTable.drop({ name, guildId })
  }
}
