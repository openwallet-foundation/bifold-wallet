import { BaseLogger } from '@credo-ts/core'
import { consoleTransport, logger } from 'react-native-logs'

import { BifoldError } from '../types/error'
import { messageFormatter } from '../../../remote-logs/src/logger'

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

  public test(...msgs: unknown[]): void {
    this._log?.test(...messageFormatter(...msgs))
  }

  public trace(...msgs: unknown[]): void {
    this._log?.trace(...messageFormatter(...msgs))
  }

  public debug(...msgs: unknown[]): void {
    this._log?.debug(...messageFormatter(...msgs))
  }

  public info(...msgs: unknown[]): void {
    this._log?.info(...messageFormatter(...msgs))
  }

  public warn(...msgs: unknown[]): void {
    this._log?.warn(...messageFormatter(...msgs))
  }

  public error(...msgs: unknown[]): void {
    this._log?.error(...messageFormatter(...msgs))
  }

  public fatal(...msgs: unknown[]): void {
    this._log?.fatal(...messageFormatter(...msgs))
  }

  public report(bifoldError: BifoldError): void {
    this._log?.info({ message: 'No remote logging configured, report not sent for error:', data: bifoldError.message })
  }
}
