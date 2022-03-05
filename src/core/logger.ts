import { BaseClass } from './base'
import { Client } from './client'

export class Logger extends BaseClass {
  public constructor (client: Client) {
    const { events } = client
    super(client)

    events.on('debug', (message) => this.log('Discord', message))
    events.on('error', (error) => this.error('Discord', error))
  }

  public log (scope: string, message: string) {
    this.client.events.emit('logInfo', scope, message)
  }

  public verbose (scope: string, message: string) {
    this.client.events.emit('logVerbose', scope, message)
  }

  public error (scope: string, error: Error) {
    this.client.events.emit('logError', scope, error)
  }
}

export class ScopedLogger extends BaseClass {
  public constructor (logger: Logger, scope: string) {
    const { log, verbose, error } = logger
    super(logger.client)

    this.logger = logger
    this.log = log.bind(logger, scope)
    this.verbose = verbose.bind(logger, scope)
    this.error = error.bind(logger, scope)
  }

  public readonly logger: Logger

  public newScope (scope: string) {
    return new ScopedLogger(this.logger, scope)
  }

  public log: (message: string) => void
  public verbose: (message: string) => void
  public error: (error: Error) => void
}
