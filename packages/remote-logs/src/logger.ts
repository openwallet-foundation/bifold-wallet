import { BifoldError, AbstractBifoldLogger, BifoldLogger } from '@bifold/core'
import { DeviceEventEmitter, EmitterSubscription } from 'react-native'
import { logger } from 'react-native-logs'

import { RemoteLoggerOptions, lokiTransport, consoleTransport } from './transports'

export enum RemoteLoggerEventTypes {
  ENABLE_REMOTE_LOGGING = 'RemoteLogging.Enable',
}

/**
 * Session ID generation constants
 */
const SESSION_ID_RANGE = {
  MIN: 100000,
  MAX: 999999,
} as const

/**
 * Standardized logging method interface with consistent overloads
 * Supports all combinations of message, data, and error parameters
 */
interface LogMethod {
  (message: string): void
  (message: string, data: Record<string, unknown>): void
  (message: string, error: Error): void
  (message: string, data: Record<string, unknown>, error: Error): void
}

export class RemoteLogger extends AbstractBifoldLogger {
  private readonly baseLogger: BifoldLogger
  private _remoteLoggingEnabled = false
  private _sessionId: number | undefined
  private _autoDisableRemoteLoggingIntervalInMinutes = 0
  private lokiUrl: string | undefined
  private lokiLabels: Record<string, string>
  private remoteLoggingAutoDisableTimer: ReturnType<typeof setTimeout> | undefined
  private eventListener: EmitterSubscription | undefined

  constructor(options: RemoteLoggerOptions) {
    super()
    this.baseLogger = new BifoldLogger()

    this.lokiUrl = options.lokiUrl ?? undefined
    this.lokiLabels = options.lokiLabels ?? {}
    this._autoDisableRemoteLoggingIntervalInMinutes = options.autoDisableRemoteLoggingIntervalInMinutes ?? 0

    this.configureLogger()
  }

  get sessionId(): number {
    if (!this._sessionId) {
      this._sessionId = Math.floor(
        SESSION_ID_RANGE.MIN + Math.random() * (SESSION_ID_RANGE.MAX - SESSION_ID_RANGE.MIN + 1)
      )
    }
    return this._sessionId
  }

  set sessionId(value: number) {
    this._sessionId = value

    this.configureLogger()
  }

  get autoDisableRemoteLoggingIntervalInMinutes(): number {
    return this._autoDisableRemoteLoggingIntervalInMinutes
  }

  get remoteLoggingEnabled(): boolean {
    return this._remoteLoggingEnabled
  }

  set remoteLoggingEnabled(value: boolean) {
    this._remoteLoggingEnabled = value

    if (value === false) {
      this._sessionId = undefined
    }

    this.configureLogger()
  }

  private configureLogger() {
    const transportOptions = {}
    const transport = [consoleTransport]
    const config = {
      ...this._config,
      transport,
      transportOptions,
    }

    if (this.remoteLoggingEnabled && this.lokiUrl) {
      transport.push(lokiTransport)
      config['transportOptions'] = {
        lokiUrl: this.lokiUrl,
        lokiLabels: {
          ...this.lokiLabels,
          session_id: `${this.sessionId}`,
        },
      }

      if (this.autoDisableRemoteLoggingIntervalInMinutes && this.autoDisableRemoteLoggingIntervalInMinutes > 0) {
        this.remoteLoggingAutoDisableTimer = setTimeout(() => {
          this.remoteLoggingEnabled = false
        }, this.autoDisableRemoteLoggingIntervalInMinutes * 60000)
      }
    }

    this._log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
  }

  public startEventListeners() {
    this.eventListener = DeviceEventEmitter.addListener(RemoteLoggerEventTypes.ENABLE_REMOTE_LOGGING, (value) => {
      this.remoteLoggingEnabled = value
    })
  }

  public stopEventListeners() {
    this.eventListener = undefined
  }

  public overrideCurrentAutoDisableExpiration(expirationInMinutes: number) {
    if (expirationInMinutes <= 0) {
      return
    }

    if (this.remoteLoggingAutoDisableTimer) {
      clearTimeout(this.remoteLoggingAutoDisableTimer)
    }

    this.remoteLoggingAutoDisableTimer = setTimeout(() => {
      this.remoteLoggingEnabled = false
    }, expirationInMinutes * 60000)
  }

  public report(bifoldError: BifoldError): void {
    this._log?.info?.({ message: 'Sending Loki report' })
    const { title, description, code, message } = bifoldError

    lokiTransport({
      msg: title,
      rawMsg: [{ message: title, data: { title, description, code, message } }],
      level: { severity: 3, text: 'error' },
      options: {
        lokiUrl: this.lokiUrl,
        lokiLabels: this.lokiLabels,
        job: 'incident-report',
      },
    })
  }

  // Standardized logging methods with consistent overloads
  public test: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.test?.({ message, data, error: actualError })
  }

  public trace: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.trace?.({ message, data, error: actualError })
  }

  public debug: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.debug?.({ message, data, error: actualError })
  }

  public info: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.info?.({ message, data, error: actualError })
  }

  public warn: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.warn?.({ message, data, error: actualError })
  }

  public error: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.error?.({ message, data, error: actualError })
  }

  public fatal: LogMethod = (message: string, dataOrError?: Record<string, unknown> | Error, error?: Error): void => {
    const { data, actualError } = this.parseLogArguments(dataOrError, error)
    this._log?.fatal?.({ message, data, error: actualError })
  }

  /**
   * Helper method to parse logging arguments consistently across all log levels
   * @param dataOrError - Either data object or Error instance
   * @param error - Optional Error instance when first param is data
   * @returns Parsed data and error objects
   */
  private parseLogArguments(
    dataOrError?: Record<string, unknown> | Error,
    error?: Error
  ): { data: Record<string, unknown> | undefined; actualError: Error | undefined } {
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

    return { data, actualError }
  }
}
