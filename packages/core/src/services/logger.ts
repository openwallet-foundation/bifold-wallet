import { BaseLogger } from '@credo-ts/core'
import { consoleTransport, logger } from 'react-native-logs'

import { BifoldError } from '../types/error'

export class BifoldLogger extends BaseLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _log: any
  protected _config = {
    levels: {
      test: 0,
      trace: 0,
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    },
    severity: 'debug',
    async: true,
    dateFormat: 'time',
    printDate: false,
  }

  public constructor() {
    super()

    const transport = [consoleTransport]
    const config = {
      ...this._config,
      transport,
    }

    this._log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
  }

  public test(message: string, data?: object | undefined): void {
    this._log?.test({ message, data })
  }

  public trace(message: string, data?: object | undefined): void {
    this._log?.trace({ message, data })
  }

  public debug(message: string, data?: object | undefined): void {
    this._log?.debug({ message, data })
  }

  public info(message: string, data?: object | undefined): void {
    this._log?.info({ message, data })
  }

  public warn(message: string, data?: object | undefined): void {
    this._log?.warn({ message, data })
  }

  public error(message: string, data?: object | undefined): void {
    this._log?.error({ message, data })
  }

  public fatal(message: string, data?: object | undefined): void {
    this._log?.fatal({ message, data })
  }

  public report(bifoldError: BifoldError): void {
    this._log?.info({ message: 'No remote logging configured, report not sent for error:', data: bifoldError.message })
  }
}
