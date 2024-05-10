import { BaseLogger } from '@credo-ts/core'
import { consoleTransport, logger } from 'react-native-logs'

export class ConsoleLogger extends BaseLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log: any
  private config = {
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
      ...this.config,
      transport,
    }

    this.log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
  }

  public test(message: string, data?: object | undefined): void {
    this.log?.test(message, data)
  }

  public trace(message: string, data?: object | undefined): void {
    this.log?.trace(message, data)
  }

  public debug(message: string, data?: object | undefined): void {
    this.log?.debug(message, data)
  }

  public info(message: string, data?: object | undefined): void {
    this.log?.info(message, data)
  }

  public warn(message: string, data?: object | undefined): void {
    this.log?.warn(message, data)
  }

  public error(message: string, data?: object | undefined): void {
    this.log?.error(message, data)
  }

  public fatal(message: string, data?: object | undefined): void {
    this.log?.fatal(message, data)
  }
}
