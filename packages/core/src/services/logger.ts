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

  protected messageFormatter(...msgs: unknown[]): unknown[] {
    return msgs.map((msg) => {
      if (msg instanceof Error) {
        return JSON.stringify(
          {
            name: msg.name,
            message: msg.message,
            stack:
              msg.stack
                ?.split('\n')
                .slice(1)
                .map((line) => line.trim()) ?? [],
          },
          null,
          2
        )
      }
      return typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg
    })
  }

  public test(...msgs: unknown[]): void {
    this._log?.test(...this.messageFormatter(...msgs))
  }

  public trace(...msgs: unknown[]): void {
    this._log?.trace(...this.messageFormatter(...msgs))
  }

  public debug(...msgs: unknown[]): void {
    this._log?.debug(...this.messageFormatter(...msgs))
  }

  public info(...msgs: unknown[]): void {
    this._log?.info(...this.messageFormatter(...msgs))
  }

  public warn(...msgs: unknown[]): void {
    this._log?.warn(...this.messageFormatter(...msgs))
  }

  public error(...msgs: unknown[]): void {
    this._log?.error(...this.messageFormatter(...msgs))
  }

  public fatal(...msgs: unknown[]): void {
    this._log?.fatal(...this.messageFormatter(...msgs))
  }

  public report(bifoldError: BifoldError): void {
    this._log?.info({ message: 'No remote logging configured, report not sent for error:', data: bifoldError.message })
  }
}
