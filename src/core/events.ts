import Discord from 'discord.js'

import { BaseClass } from './base'
import { Client } from './client'

export interface ClientEvents extends Discord.ClientEvents {
  logInfo: [scope: string, message: string]
  logVerbose: [scope: string, message: string]
  logError: [scope: string, error: Error]
}

export class EventEmitter extends BaseClass {
  public static bindEventEmitter (discord: Discord.Client, eventEmitter: EventEmitter) {
    const oldEmit = discord.emit
    const newEmit = <Discord.Client['emit']><any> eventEmitter.emit

    discord.emit = (...args: Parameters<Discord.Client['emit']>): boolean => {
      oldEmit.call(discord, ...args)
      newEmit.call(eventEmitter, ...args)

      return true
    }
  }

  public constructor (client: Client) {
    super(client)

    this.listeners = <this['listeners']> {}
    EventEmitter.bindEventEmitter(client.discordClient, this)
  }

  public readonly listeners: {
    [Property in keyof ClientEvents]: Array<{
      listener: (...args: ClientEvents[Property]) => (void | Promise<void>)
      once: boolean
    }>
  }

  public on <T extends keyof ClientEvents> (name: T, listener: (...args: ClientEvents[T]) => (void | Promise<void>), once: boolean = false) {
    return (this.listeners[name] || (this.listeners[name] = [])).push({ listener, once })
  }

  public once <T extends keyof ClientEvents> (name: T, listener: (...args: ClientEvents[T]) => (void | Promise<void>)) {
    return this.on(name, listener, true)
  }

  public async emit <T extends keyof ClientEvents> (name: T, ...args: ClientEvents[T]) {
    const listeners = this.listeners[name]

    if (!listeners) {
      return
    }

    await Promise.all(listeners.map(async (entry) => {
      const { once } = entry
      const listener = <any> entry.listener

      if (once) {
        listeners.splice(listeners.indexOf(<any> entry), 1)
      }

      await listener(...args)?.catch(console.error)
    }))
  }
}
