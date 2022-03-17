import { BaseArrayManager, BaseClass } from './base'
import { Client } from './client'
import { CommandManager, CommandRunner } from './command'
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
    const newEmit = <any> (async (name: string, ...args: Array<any>) => {
      for (const module of modules.entries) {
        const listener = (<any> module.eventListeners)[name]

        if (listener) {
          await listener.call(module, ...args)
        }
      }
    })

    eventEmitter.emit = <any> (async (...args: Array<any>) => {
      await oldEmit.call(eventEmitter, ...args)
      await newEmit.call(modules, ...args)
    })
  }

  public constructor (client: Client) {
    super(client)

    this.logger = client.logger.newScope('Module Manager')
    this.commandRunner = new CommandRunner(this)
    ModuleManager.bindEventEmitter(this, client.events)
    client.on('ready', () => this.init())
  }

  public get moduleTable () {
    return this.database.getTableManager('module')
  }

  public get moduleGuildOverrideTable () {
    return this.database.getTableManager('moduleGuildOverride')
  }

  public readonly logger: ScopedLogger
  public readonly commandRunner: CommandRunner

  public async init () {
    await this.commandRunner.init()
  }

  public add (...entries: Module[]) {
    this.entries.push(...entries)

    for (const entry of entries) {
      this.logger.log(`Register module: ${entry.name}`)
    }
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
