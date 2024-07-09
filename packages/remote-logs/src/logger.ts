import { BaseLogger } from '@credo-ts/core'
import { DeviceEventEmitter, EmitterSubscription } from 'react-native'
import { consoleTransport, logger } from 'react-native-logs'

import { RemoteLoggerOptions, lokiTransport } from './transports'

export enum RemoteLoggerEventTypes {
  ENABLE_REMOTE_LOGGING = 'RemoteLogging.Enable',
}

export class RemoteLogger extends BaseLogger {
  private _remoteLoggingEnabled = false
  private _sessionId: number | undefined
  private _autoDisableRemoteLoggingIntervalInMinutes = 0
  private lokiUrl: string | undefined
  private lokiLabels: Record<string, string>
  private remoteLoggingAutoDisableTimer: ReturnType<typeof setTimeout> | undefined
  private eventListener: EmitterSubscription | undefined
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

  constructor(options: RemoteLoggerOptions) {
    super()

    this.lokiUrl = options.lokiUrl ?? undefined
    this.lokiLabels = options.lokiLabels ?? {}
    this._autoDisableRemoteLoggingIntervalInMinutes = options.autoDisableRemoteLoggingIntervalInMinutes ?? 0

    this.configureLogger()
  }

  get sessionId(): number {
    if (!this._sessionId) {
      this._sessionId = Math.floor(100000 + Math.random() * 900000)
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
      ...this.config,
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

    this.log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
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

  public test(message: string, data?: object | undefined): void {
    this.log?.test({ message, data })
  }

  public trace(message: string, data?: object | undefined): void {
    this.log?.trace({ message, data })
  }

  public debug(message: string, data?: object | undefined): void {
    this.log?.debug({ message, data })
  }

  public info(message: string, data?: object | undefined): void {
    this.log?.info({ message, data })
  }

  public warn(message: string, data?: object | undefined): void {
    this.log?.warn({ message, data })
  }

  public error(message: string, data?: object | undefined): void {
    this.log?.error({ message, data })
  }

  public fatal(message: string, data?: object | undefined): void {
    this.log?.fatal({ message, data })
  }
}
