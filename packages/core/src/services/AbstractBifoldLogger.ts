import { BaseLogger } from '@credo-ts/core'

import { BifoldError } from '../types/error'

export abstract class AbstractBifoldLogger extends BaseLogger {
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

  public test(message: string, data?: Record<string, unknown>): void {
    this._log?.test({ message, data })
  }

  public trace(message: string, data?: Record<string, unknown>): void {
    this._log?.trace({ message, data })
  }

  public debug(message: string, data?: Record<string, unknown>): void {
    this._log?.debug({ message, data })
  }

  public info(message: string, data?: Record<string, unknown>): void {
    this._log?.info({ message, data })
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this._log?.warn({ message, data })
  }

  // Allow for overload signatures for error method, I think
  // this makes the clearest API.
  public error(message: string): void
  public error(message: string, data: Record<string, unknown>): void
  public error(message: string, error: Error): void
  public error(message: string, data: Record<string, unknown>, error: Error): void
  public error(message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void {
    let data: Record<string, unknown> | undefined
    let actualError: Error | undefined

    if (dataOrError instanceof Error) {
      // Second parameter is an Error, so no data
      actualError = dataOrError
    } else {
      // Second parameter is data (or undefined)
      data = dataOrError
      actualError = error
    }

    this._log?.error({ message, data, error: actualError })
  }

  // Allow for overload signatures for fatal method, I think
  // this makes the clearest API.
  public fatal(message: string): void
  public fatal(message: string, data: Record<string, unknown>): void
  public fatal(message: string, error: Error): void
  public fatal(message: string, data: Record<string, unknown>, error: Error): void
  public fatal(message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void {
    let data: Record<string, unknown> | undefined
    let actualError: Error | undefined

    if (dataOrError instanceof Error) {
      // Second parameter is an Error, so no data
      actualError = dataOrError
    } else {
      // Second parameter is data (or undefined)
      data = dataOrError
      actualError = error
    }

    this._log?.fatal({ message, data, error: actualError })
  }

  public abstract report(bifoldError: BifoldError): void
}
